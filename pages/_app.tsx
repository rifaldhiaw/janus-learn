import "../styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { JanusProvider } from "../src/domain/janus/janusProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <JanusProvider>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </JanusProvider>
  );
}

export default MyApp;
