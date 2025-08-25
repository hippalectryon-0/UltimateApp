import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import I18n from '../../utils/i18n';
import theme from '../../styles/theme.style';

const VimeoVideo = ({ vimeoId, sounds, shouldPlay }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Vimeo player URL with parameters
  const vimeoPlayerUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=${shouldPlay ? 1 : 0}&loop=1&muted=${
    sounds ? 0 : 1
  }&transparent=0`;

  const onError = () => {
    setError(true);
    setIsLoading(false);
  };

  const onLoad = () => {
    setIsLoading(false);
  };

  const onLoadEnd = () => {
    setIsLoading(false);
  };

  const renderLoader = () => {
    if (!isLoading) return null;

    return (
      <View style={styles.spinnerStyle}>
        <ActivityIndicator animating color={theme.COLOR_SECONDARY} size="large" />
        <Text>{I18n.t('vimeoVideo.loading')}</Text>
      </View>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <View style={styles.spinnerStyle}>
        <Text>{I18n.t('vimeoVideo.error')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.videoContainer}>
      {renderLoader()}
      {renderError()}
      <WebView
        source={{ uri: vimeoPlayerUrl }}
        style={styles.webView}
        javaScriptEnabled
        domStorageEnabled
        onError={onError}
        onLoad={onLoad}
        onLoadEnd={onLoadEnd}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback
        scrollEnabled={false}
        bounces={false}
        originWhitelist={['*']}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    height: 250,
    backgroundColor: '#000',
  },
  webView: {
    width: '100%',
    height: 250,
  },
  spinnerStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
});

export default VimeoVideo;
