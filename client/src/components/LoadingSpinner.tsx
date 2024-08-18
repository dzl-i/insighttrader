import { useTheme } from 'next-themes';
import React from 'react';
import { Bars } from 'react-loader-spinner';

const LoadingSpinner = ({ size = 30 }) => {
  const { theme } = useTheme();
  
  return (
    <Bars
      ariaLabel="loading"
      height={size}
      width={size}
      wrapperStyle={{}}
      wrapperClass="text-white"
      color={theme === 'light' ? '#000000' : '#ffffff'}
      visible={true}
    />
  );
};

export default LoadingSpinner;