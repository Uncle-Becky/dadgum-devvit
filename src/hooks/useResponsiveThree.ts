import { useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useMediaQuery } from 'react-responsive';

export const useResponsiveThree = () => {
  const { camera, size, set } = useThree();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });

  const updateCameraSettings = useCallback(() => {
    if (!camera) return;

    if (isMobile) {
      camera.fov = 75;
      camera.position.z = 5;
    } else if (isTablet) {
      camera.fov = 65;
      camera.position.z = 4;
    } else {
      camera.fov = 60;
      camera.position.z = 3;
    }

    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
  }, [camera, size, isMobile, isTablet]);

  useEffect(() => {
    updateCameraSettings();

    const handleResize = () => {
      updateCameraSettings();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCameraSettings]);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    updateCameraSettings
  };
};
