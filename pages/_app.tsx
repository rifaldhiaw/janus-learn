import "../styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { useInterpret } from "@xstate/react";
import { janusMachine } from "../src/domain/janus/janusMachine";
import { janusSessionMachine } from "../src/domain/janus/janusSessionMachine";
import { janusPluginMachine } from "../src/domain/janus/janusPluginMachine";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
