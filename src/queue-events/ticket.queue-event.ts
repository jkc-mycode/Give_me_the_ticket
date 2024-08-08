import { QueueEventsHost, QueueEventsListener } from '@nestjs/bullmq';
import { QUEUES } from 'src/commons/constants/queue.constant';

//이벤트의 완료여부
@QueueEventsListener(QUEUES.TICKET_QUEUE)
export class TicketQueueEvents extends QueueEventsHost {}
