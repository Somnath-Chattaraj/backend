import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import prisma from "../lib/prisma";
import axios, { AxiosResponse } from "axios";

interface HiveTransaction {
  block_num: number;
  expiration: string;
  extensions: any[];
  operations: Operation[];
  ref_block_num: number;
  ref_block_prefix: number;
  signatures: string[];
}
interface Operation {
  type: string;
  value: {
    id: string;
    json: string;
    required_auths: string[];
    required_posting_auths: string[];
  };
}
interface BookingDetails {
  username: string;
  ticketsBooked: number;
  ticketType: string;
  bookingDateTime: string;
  concertId: string;
  concertName: string;
  totalAmount: number;
}
interface TicketWithBlockchainData {
  ticketId: string;
  eventId: string;
  eventDetails: any;
  blockchainDetails: {
    transactionId: string;
    username: string;
    ticketsBooked: number;
    ticketType: string;
    bookingDateTime: string;
    concertId: string;
    concertName: string;
    totalAmount: number;
  };
}

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
      const response: AxiosResponse<{ result: HiveTransaction }> =
        await axios.post("https://api.hive.blog", {
          jsonrpc: "2.0",
          method: "account_history_api.get_transaction",
          params: { id: transactionId },
          id: 1,
        });

      //   console.log(response.data.result);

      const operations: Operation[] = response.data.result.operations;
      const customJsonOperation = operations.find(
        (op) =>
          op.type === "custom_json_operation" &&
          op.value.id === "fanshow_booking"
      );

      if (!customJsonOperation) {
        console.warn(
          `No booking details found for transaction ID ${transactionId}`
        );
        return;
      }

      const bookingDetails: BookingDetails = JSON.parse(
        customJsonOperation.value.json
      );
      const ticketWithBlockchainData: TicketWithBlockchainData = {
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
      };

      ticketsWithBlockchainData.push(ticketWithBlockchainData);

      res.json(ticketsWithBlockchainData);
    } catch (error) {
      console.log("Error fetching transaction details", error);
    }
  }
});
