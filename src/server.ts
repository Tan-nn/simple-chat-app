import express, { Application } from "express";
import { Server } from "socket.io";
import { createServer, Server as HTTPServer } from "http";
import path from "path";

export class ServerX {
  private httpServer: HTTPServer;
  private app: Application;
  private io: Server;

  private activeSockets: string[] = [];

  private readonly DEFAULT_PORT = 5100;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.io = new Server(5000, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.configureApp();
    this.configureRoutes();
    // this.handleSocketConnection();
    this.handelSocketRoomConnection();
  }

  private configureApp(): void {
    this.app.use(express.static(path.join(__dirname, "../public")));
  }

  private configureRoutes(): void {
    this.app.get("/", (req, res) => {
      res.sendFile("index.html");
    });
  }


  private handelSocketRoomConnection(): void {
    this.io.on("connection", socket => {
      socket.on("join-room", async (data: any) => {
        console.log('join-room....', data.roomCode)
        socket.join(data.roomCode);
        //Send this event to everyone in the room.
        this.io.sockets.in(data.roomCode).emit('listen-new-room-member', { socketId: socket.id });
        let roomUsers = await this.io.in(data.roomCode).fetchSockets();
        console.log('roomUsers:: ', roomUsers.length)
      });

      socket.on('create-offer', (data) => {
        console.log('create-offer ...', data.offer)
        socket.to(data.roomCode).emit('listen-offer', data)
      });

      socket.on("create-answer", data => {
        console.log('create-answer..', data.answer?.type)
        socket.to(data.roomCode).emit("listen-answer", {
          answer: data.answer,
          roomCode: data.roomCode
        });
      });

      socket.on('create-candidate', (data) => {
        console.log('share-screen ...', data)
        socket.to(data.roomCode).emit('listen-candidate', data)
      });

      socket.on('share-screen', (data) => {
        console.log('share-screen ...', data)
        socket.to(data.roomCode).emit('share-screen-offer', data)
      });

    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }
}
