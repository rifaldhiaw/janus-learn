import type { NextPage } from "next";
import { Button, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();

  const handleTextRoomPressed = () => {
    router.push("/text-room");
  };

  const handleTextRoomNewPressed = () => {
    router.push("/text-room-new");
  };

  return (
    <Flex height="100vh" justify="center" align="center">
      <Button onClick={handleTextRoomPressed} colorScheme="blue">
        Text Room
      </Button>
      <Button onClick={handleTextRoomNewPressed} colorScheme="blue">
        Text Room New Ins
      </Button>
    </Flex>
  );
};

export default Home;
