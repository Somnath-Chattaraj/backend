import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import axios from "axios";

interface CustomJsonOperationData {
  id: string;
  json: string;
  required_auths: string[];
  required_posting_auths: string[];
}

// Define the structure of an operation tuple
type Operation = ["custom_json", CustomJsonOperationData];

export const getTickets = asyncHandler(async (req: Request, res: Response) => {
  //@ts-ignore
  const user = req.user;
  const tickets = await prisma.tickets.findMany({
    where: {
      userId: user.id,
    },
    select: {
      ticketId: true,
      eventId: true,
      event: {
        select: {
          artistName: true,
          concertName: true,
          description: true,
        },
      },
    },
  });

  if (tickets.length === 0) {
    res.status(404).json({ message: "No tickets found" });
    return;
  }

  const ticketsWithBlockchainData = [];
  for (const ticket of tickets) {
    const transactionId = ticket.ticketId;

    try {
      const response = await axios.post("https://api.hive.blog", {
        jsonrpc: "2.0",
        method: "account_history_api.get_transaction",
        params: { id: transactionId },
        id: 1,
      });
      const operations: Operation[] = response.data.result.operations;
      const customJsonOperation = operations.find(
        (op) => op[0] === "custom_json" && op[1].id === "fanshow_booking"
      );

      if (!customJsonOperation) {
        console.warn(
          `No booking details found for transaction ID ${transactionId}`
        );
        continue;
      }

      const bookingDetails = JSON.parse(customJsonOperation[1].json);
      ticketsWithBlockchainData.push({
        ticketId: ticket.ticketId,
        eventId: ticket.eventId,
        eventDetails: ticket.event,
        blockchainDetails: {
          transactionId,
          username: bookingDetails.username,
          ticketsBooked: bookingDetails.ticketsBooked,
          ticketType: bookingDetails.ticketType,
          bookingDateTime: bookingDetails.bookingDateTime,
          concertId: bookingDetails.concertId,
          concertName: bookingDetails.concertName,
          totalAmount: bookingDetails.totalAmount,
        },
      });

      res.json(ticketsWithBlockchainData);
    } catch (error) {
      console.log("Error fetching transaction details", error);
    }
  }
});
