import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useVideoPlayer, VideoView, FullscreenUpdate } from 'expo-video';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useFocusEffect } from '@react-navigation/native';

import I18n from '../../utils/i18n';
import theme from '../../styles/theme.style';

const VimeoVideo = ({ vimeoId, sounds, shouldPlay }) => {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isBuffering, setBuffer] = useState(true);
  const [error, setError] = useState();
  const playerRef = useRef(null);

  const player = useVideoPlayer(videoUrl, (player) => {
    if (videoUrl) {
      player.loop = true;
      player.muted = !sounds;
      if (shouldPlay) {
        player.play();
      }
      // Store the player in a ref so we can access it in the cleanup function
      playerRef.current = player;
    }
  });

  useEffect(() => {
    const vimeoUrlSource = `https://player.vimeo.com/video/${vimeoId}/config`;
    let aborted = false;
    setBuffer(true);
    setError(null);

    fetch(vimeoUrlSource)
      .then((res) => res.json())
      .then((res) => {
        const videoArray = res.request.files.progressive;
        const videoVimeoQuality = videoArray.find((videoObject) => videoObject.quality === '540p');
        if (videoVimeoQuality) {
          return videoVimeoQuality.url;
        }
      })
      .then((url) => {
        if (aborted) return;
        setVideoUrl(url);
        setBuffer(false);
      })
      .catch((e) => {
        if (aborted) return;
        setError(e);
        setBuffer(false);
      });

    return () => (aborted = true);
  }, [vimeoId]);

  // Stop playing the video on screen change
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        if (playerRef.current) {
          playerRef.current.pause();
        }
      };
    }, []),
  );

  const renderBufferIcon = () => {
    return (
      <View style={styles.spinnerStyle}>
        <ActivityIndicator animating color={theme.COLOR_SECONDARY} size="large" />
        <Text>{I18n.t('vimeoVideo.loading')}</Text>
      </View>
    );
  };

  const renderError = () => {
    return (
      <View style={styles.spinnerStyle}>
        <Text>{I18n.t('vimeoVideo.error')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.videoContainer}>
      {error && renderError()}
      {isBuffering && renderBufferIcon()}
      {videoUrl && (
        <VideoView
          style={{ width: '100%', height: 250 }}
          player={player}
          allowsFullscreen
          onFullscreenUpdate={async ({ fullscreenUpdate }) => {
            if (fullscreenUpdate === FullscreenUpdate.WILL_PRESENT) {
              await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
            }
            if (fullscreenUpdate === FullscreenUpdate.WILL_DISMISS) {
              await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            }
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    flex: 1,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerStyle: {
    position: 'absolute',
  },
});

export default VimeoVideo;
