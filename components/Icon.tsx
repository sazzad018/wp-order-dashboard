import React from 'react';

interface IconProps {
  icon: 'close' | 'user' | 'calendar' | 'money' | 'location' | 'note' | 'search' | 'settings';
  className?: string;
}

// Fixed: Changed JSX.Element to React.ReactElement to explicitly use the React namespace and resolve the "Cannot find namespace 'JSX'" error.
const ICONS: Record<IconProps['icon'], React.ReactElement> = {
  close: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  user: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M-4.5 12h22.5" />
    </svg>
  ),
  money: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.75A.75.75 0 013 4.5h.75m0 0h.75A.75.75 0 015.25 6v.75m0 0v.75A.75.75 0 014.5 8.25h-.75m0 0H3.75a.75.75 0 01-.75-.75V7.5m0 0V6A.75.75 0 013.75 5.25h.75M15 11.25a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12.75c0 .621-.504 1.125-1.125 1.125H10.125c-.621 0-1.125-.504-1.125-1.125V11.25c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v1.5z" />
    </svg>
  ),
  location: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  note: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  ),
  settings: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-1.007 1.11-1.227l.268-.106c.44-.174.92-.174 1.36 0l.268.106c.55.22 1.02.685 1.11 1.227l.068.402c.168.995.94 1.767 1.933 1.933l.402.068c.542.09 1.007.56 1.227 1.11l.106.268c.174.44.174.92 0 1.36l-.106.268c-.22.55-.685 1.02-1.227 1.11l-.402.068c-.995.168-1.767.94-1.933 1.933l-.068.402c-.09.542-.56 1.007-1.11 1.227l-.268.106c-.44.174-.92.174-1.36 0l-.268-.106c-.55-.22-1.02-.685-1.11-1.227l-.068-.402c-.168-.995-.94-1.767-1.933-1.933l-.402-.068c-.542-.09-1.007-.56-1.227-1.11l-.106-.268c-.174-.44-.174-.92 0-1.36l.106-.268c.22-.55.685-1.02 1.227-1.11l.402-.068c.995-.168 1.767-.94 1.933-1.933l.068-.402zM12 15a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  )
};

export const Icon: React.FC<IconProps> = ({ icon, className = 'w-6 h-6' }) => {
  return <div className={className}>{ICONS[icon]}</div>;
};