import compression from "compression";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { mainRouter } from "./routes";

const app = express();

export function expressApp() {
  app.set("trust proxy", true);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(helmet());
  app.use(compression());

  app.use("/", mainRouter);

  app.use((error, request: Request, response: Response, next: NextFunction) => {
    if (response.headersSent) {
      next(error);
    }

    const errors = [
      { errorText: "Reservation", message: "{message}", httpCode: 500 },
      { errorText: "Checkins", message: "{message}", httpCode: 500 },
      { errorText: "Invalid", message: "{message}", httpCode: 500 },
      { errorText: "E11000", message: "{message}", httpCode: 500 },
      { errorText: "booked", message: "{message}", httpCode: 500 },
      { errorText: "exists", message: "{message}", httpCode: 500 },
      { errorText: "rooms", message: "{message}", httpCode: 500 },
      { errorText: "guest", message: "{message}", httpCode: 500 },
      { errorText: "Guest", message: "{message}", httpCode: 500 },
      { errorText: "not found", message: "{message}", httpCode: 500 }
    ];

    let errorObject;
    const errorMessage = error.message.toUpperCase();
    for (const thisError of errors) {
      if (errorMessage.includes(thisError.errorText.toUpperCase())) {
        errorObject = thisError;
        break;
      }
    }

    const result = {
      status: "Failed",
      result: errorObject ? errorObject.message : error.message
    };

    if (errorObject) {
      if (result.result === "{message}") {
        result.result = error.message;
      }
      console.error(`${request.method}:${request.originalUrl}:${result.result}`);
      response.status(errorObject.httpCode).json(result);
      return;
    }
    console.error(
      `${request.method}:${request.originalUrl}:${error.status}:${error.message}`
    );
    const codes = [404];
    if (codes.some(x => error.status)) {
      response.sendStatus(error.status);
      return;
    }
    next(error);
  });

  return app;
}
