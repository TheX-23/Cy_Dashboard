import asyncio
import json

import websockets


async def listen(name: str, url: str):
    async with websockets.connect(url) as ws:
        for _ in range(4):
            message = await ws.recv()
            print(f"[{name}] {message}")


async def main():
    threats_url = "ws://localhost:8001/ws/threats"
    alerts_url = "ws://localhost:8001/ws/alerts"
    await asyncio.gather(
        listen("client-a-threats", threats_url),
        listen("client-b-threats", threats_url),
        listen("client-c-alerts", alerts_url),
    )


if __name__ == "__main__":
    asyncio.run(main())
