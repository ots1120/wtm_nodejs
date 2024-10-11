import mongoose from 'mongoose';
import schemaOptions from '../common/schemaOptions';

const ticketHistorySaleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
  },
  schemaOptions
);

const TicketHistorySaleModel = mongoose.model(
  'TicketHistorySale',
  ticketHistorySaleSchema
);

export default TicketHistorySaleModel;
