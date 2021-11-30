import type { NextPage } from "next";
import { Button, Stack } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

const Home: NextPage = () => {
  const router = useRouter();

  const handleTextRoomPressed = () => {
    router.push("/text-room");
  };

  const handleVideoRoomPressed = () => {
    router.push("/video-room");
  };

  return (
    <Stack height="100vh" justify="center" align="center">
      <Button onClick={handleTextRoomPressed} colorScheme="blue">
        Text Room
      </Button>
      <Button onClick={handleVideoRoomPressed} colorScheme="blue">
        Video Room
      </Button>
    </Stack>
  );
};

export default Home;
