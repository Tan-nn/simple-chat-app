import express, { Application } from "express";
import  { Server} from "socket.io";
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


  private handelSocketRoomConnection() : void {
    this.io.on("connection", socket => {
      socket.on("join-room", async (data: any) => {
        console.log('join-room....', data.roomCode)
        socket.join(data.roomCode);
        //Send this event to everyone in the room.
        this.io.sockets.in(data.roomCode).emit('listen-new-room-member', {socketId: socket.id});
        let roomUsers = await this.io.in(data.roomCode).fetchSockets();
        console.log('roomUsers:: ', roomUsers.length)
      });

      // this.io.sockets.in("room-x").on('listen-new-room-member', () = > "You are in room no. room-x");
      socket.on('call-user', (data) => {
        console.log('call-user ...', data.offer?.type)
        socket.to(data.roomCode).emit('call-made', data)
      })

      socket.on("make-answer", data => {
        console.log('make-answer..', data.answer?.type)
        socket.to(data.roomCode).emit("answer-made", {
          answer: data.answer,
          roomCode: data.roomCode
        });
      });
      socket.on('share-screen', (data) => {
        console.log('share-screen ...', data)
        socket.to(data.roomCode).emit('share-screen-offer', data)
      })
    });
  }

  private handleSocketConnection(): void { 
    console.log('handleSocketConnection..')
    this.io.on("connection", socket => {
      const existingSocket = this.activeSockets.find(
        existingSocket => existingSocket === socket.id
      );

      if (!existingSocket) {
        this.activeSockets.push(socket.id);

        socket.emit("update-user-list", {
          users: this.activeSockets.filter(
            existingSocket => existingSocket !== socket.id
          )
        });

        socket.broadcast.emit("update-user-list", {
          users: [socket.id]
        });
      }

      socket.on("call-user", (data: any) => {

        console.log('call-user..', data.to)
        socket.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id
        });
      });

      socket.on("make-answer", data => {
        console.log('make-answer..', data)
        socket.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer
        });
      });

      socket.on("reject-call", data => {
        console.log('reject-call..', data.from)

        socket.to(data.from).emit("call-rejected", {
          socket: socket.id
        });
      });

      socket.on("disconnect", () => {
        console.log('disconnect..')
        this.activeSockets = this.activeSockets.filter(
          existingSocket => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
          socketId: socket.id
        });
      });
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.DEFAULT_PORT, () => {
      callback(this.DEFAULT_PORT);
    });
  }
}
