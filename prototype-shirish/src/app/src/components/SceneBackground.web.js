import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import StarPlaceholder from "./StarPlaceholder";
import { sceneUrl } from "../lib/server";

/**
 * The shared live scene (served by the server at /scene, one per crew) as a full-bleed,
 * non-interactive background layer (`interactive` lets clicks through to the scene, e.g. the Earth demo's next arrow). Web: an <iframe>. (Native uses react-native-webview.)
 * A static starfield sits underneath until the scene has loaded.
 */
export default function SceneBackground({ server, code, interactive }) {
  const [loadedUrl, setLoadedUrl] = useState(null);
  const url = server ? sceneUrl(server, code) : null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={interactive ? "box-none" : "none"}>
      <StarPlaceholder />
      {url
        ? React.createElement("iframe", {
            key: url,
            src: url,
            title: "Crew rocket scene",
            onLoad: () => setLoadedUrl(url),
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: 0,
              pointerEvents: interactive ? "auto" : "none",
              opacity: loadedUrl === url ? 1 : 0,
            },
          })
        : null}
    </View>
  );
}
