import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface ConnectionConfig {
  url: string;
  token: string;
}

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ConnectionConfig) => void;
  onDisconnect: () => void;
  currentConfig: ConnectionConfig | null;
}

const pluginCode = `<?php
/**
 * Plugin Name:       Order Dashboard Connector
 * Plugin URI:        https://github.com/google-gemini/order-dashboard-app
 * Description:       Provides a secure, token-based connection for the external Order Dashboard application to view and manage WooCommerce orders.
 * Version:           1.3.0
 * Author:            Gemini AI
 * Author URI:        https://gemini.google.com/
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       order-dashboard-connector
 * WC requires at least: 5.0.0
 * WC tested up to: 8.5.0
 */

if ( ! defined( 'WPINC' ) ) {
	die;
}

// Ensure WooCommerce is active.
if ( ! in_array( 'woocommerce/woocommerce.php', apply_filters( 'active_plugins', get_option( 'active_plugins' ) ) ) ) {
    add_action( 'admin_notices', function() {
        echo '<div class="notice notice-error"><p><strong>Order Dashboard Connector:</strong> WooCommerce must be activated for this plugin to work.</p></div>';
    });
    return;
}

class Order_Dashboard_Connector {
    private static $instance;
    private $token_option_key = 'odc_connection_token';

    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        add_action( 'rest_api_init', [ $this, 'register_api_routes' ] );
        register_activation_hook( __FILE__, [ $this, 'generate_token_on_activation' ] );
    }

    public function generate_token_on_activation() {
        if ( ! get_option( $this->token_option_key ) ) {
            update_option( $this->token_option_key, wp_generate_password( 64, false, false ) );
        }
    }

    public function add_admin_menu() {
        add_submenu_page(
            'woocommerce', 'Order Dashboard', 'Order Dashboard', 'manage_woocommerce',
            'order-dashboard-settings', [ $this, 'create_settings_page' ]
        );
    }

    public function create_settings_page() {
        ?>
        <div class="wrap">
            <h1>Order Dashboard Connection Settings</h1>
            <p>Use the details below to connect your external Order Dashboard application.</p>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="odc_store_url">Store URL</label></th>
                    <td>
                        <input type="text" id="odc_store_url" readonly value="<?php echo esc_url( home_url( '/' ) ); ?>" class="regular-text" onclick="this.select();" />
                        <p class="description">This is the URL of your WordPress site.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label for="odc_connection_token">Connection Token</label></th>
                    <td>
                        <input type="text" id="odc_connection_token" readonly value="<?php echo esc_attr( get_option( $this->token_option_key ) ); ?>" class="regular-text" onclick="this.select();" />
                        <p class="description">This token provides secure access to your orders. Keep it safe.</p>
                    </td>
                </tr>
            </table>
        </div>
        <?php
    }

    public function register_api_routes() {
        register_rest_route( 'order-dashboard/v1', '/orders', [
            'methods'  => 'GET, OPTIONS', 'callback' => [ $this, 'get_orders' ], 'permission_callback' => [ $this, 'permission_check' ],
        ]);
        register_rest_route( 'order-dashboard/v1', '/orders/(?P<id>\\d+)', [
            'methods'  => 'PUT, OPTIONS', 'callback' => [ $this, 'update_order' ], 'permission_callback' => [ $this, 'permission_check' ],
        ]);
    }
    
    public function add_cors_headers( $result ) {
        header( 'Access-Control-Allow-Origin: *' );
		header( 'Access-Control-Allow-Methods: GET, PUT, OPTIONS' );
		header( 'Access-Control-Allow-Headers: X-Order-Dashboard-Token, Content-Type' );
        return $result;
    }
    
    public function permission_check( WP_REST_Request $request ) {
        add_filter( 'rest_pre_serve_request', [ $this, 'add_cors_headers' ] );
        
        // Handle OPTIONS preflight request for CORS
        if ( 'OPTIONS' === $request->get_method() ) {
            return true; 
        }

        $token = $request->get_header( 'X-Order-Dashboard-Token' );
        $stored_token = get_option( $this->token_option_key );
        if ( ! $token || ! $stored_token || ! hash_equals( $stored_token, $token ) ) {
            return new WP_Error( 'rest_forbidden', 'Invalid connection token.', [ 'status' => 401 ] );
        }
        return true;
    }

    private function execute_as_admin( $callback ) {
        $original_user_id = get_current_user_id();
        $admin_users = get_users( [ 'role' => 'administrator', 'number' => 1 ] );
        if ( empty( $admin_users ) ) {
            $admin_users = get_users( [ 'role' => 'shop_manager', 'number' => 1 ] );
        }

        if ( empty( $admin_users ) ) {
            return new WP_Error( 'no_permission_user', 'Cannot find a user with sufficient permissions (Administrator or Shop Manager).', [ 'status' => 500 ] );
        }
        
        wp_set_current_user( $admin_users[0]->ID );
        $response = $callback();
        wp_set_current_user( $original_user_id );
        return $response;
    }

    public function get_orders( WP_REST_Request $request ) {
        return $this->execute_as_admin( function() use ( $request ) {
            $controller = new WC_REST_Orders_Controller();
            return rest_ensure_response( $controller->get_items( $request ) );
        });
    }

    public function update_order( WP_REST_Request $request ) {
        return $this->execute_as_admin( function() use ( $request ) {
            $controller = new WC_REST_Orders_Controller();
            return rest_ensure_response( $controller->update_item( $request ) );
        });
    }
}
Order_Dashboard_Connector::get_instance();
`;

const ConnectionModal: React.FC<ConnectionModalProps> = ({ isOpen, onClose, onSave, onDisconnect, currentConfig }) => {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (currentConfig) {
      setUrl(currentConfig.url);
      setToken(currentConfig.token);
    } else {
      setUrl('');
      setToken('');
    }
  }, [currentConfig, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.startsWith('https://') && !url.startsWith('http://')) {
        alert('Please enter a valid URL starting with http:// or https://');
        return;
    }
    if (url.trim() && token.trim()) {
      onSave({ url: url.trim(), token: token.trim() });
    } else {
        alert('Please fill in all fields.');
    }
  };

  const handleDownloadPlugin = () => {
    const blob = new Blob([pluginCode], { type: 'text/php' });
    const fileUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'order-dashboard-connector.php';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(fileUrl);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Connect to WooCommerce</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon icon="close" className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSave}>
            <div className="p-6 space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                    <h4 className="font-semibold text-blue-800">How to Connect:</h4>
                     <ol className="list-decimal list-inside text-sm text-blue-700 mt-2 space-y-2">
                        <li>
                            Click the button to download the connector plugin file.
                            <button
                                type="button"
                                onClick={handleDownloadPlugin}
                                className="inline-block ml-2 px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Download Plugin (.php)
                            </button>
                        </li>
                        <li>
                            <strong>Important:</strong> You must compress the downloaded <code>order-dashboard-connector.php</code> file into a <strong>.zip</strong> archive.
                            <ul className="list-disc list-inside ml-4 text-xs mt-1">
                                <li><strong>Windows:</strong> Right-click the file &rarr; Send to &rarr; Compressed (zipped) folder.</li>
                                <li><strong>Mac:</strong> Right-click the file &rarr; Compress "order-dashboard-connector.php".</li>
                            </ul>
                        </li>
                        <li>On your WordPress site, go to <code className="text-xs">Plugins &gt; Add New &gt; Upload Plugin</code> and upload the <strong>.zip</strong> file you just created.</li>
                        <li>Activate the <strong>"Order Dashboard Connector"</strong> plugin.</li>
                        <li>Go to <code className="text-xs">WooCommerce &gt; Order Dashboard</code> in your admin area.</li>
                        <li>Copy the Store URL and Connection Token from that page and paste them below.</li>
                    </ol>
                </div>
                <div>
                    <label htmlFor="woo-url" className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
                    <input 
                        type="text" 
                        id="woo-url" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-white text-gray-900 border-gray-300 rounded-md shadow-sm p-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="woo-token" className="block text-sm font-medium text-gray-700 mb-1">Connection Token</label>
                    <input 
                        type="password" 
                        id="woo-token" 
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="Paste your token here"
                        className="w-full bg-white text-gray-900 border-gray-300 rounded-md shadow-sm p-2 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        required
                    />
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-between items-center rounded-b-lg">
                <div>
                    {currentConfig && (
                        <button 
                            type="button"
                            onClick={onDisconnect}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                            Disconnect
                        </button>
                    )}
                </div>
                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {currentConfig ? 'Save Changes' : 'Save & Connect'}
                    </button>
                </div>
            </div>
        </form>

      </div>
    </div>
  );
};

export default ConnectionModal;