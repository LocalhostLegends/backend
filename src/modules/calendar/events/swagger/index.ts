import {
  ApiEventsTags,
  ApiRespondToEvent,
  ApiFindAllEvents,
  ApiFindOneEvent,
  ApiCreateEvent,
  ApiUpdateEvent,
  ApiDeleteEvent,
} from './events.decorators';
import { EventFields, QueryEventFields } from './events.fields';

export const Swagger = {
  ApiTags: ApiEventsTags,
  ApiRespond: ApiRespondToEvent,
  ApiFindAll: ApiFindAllEvents,
  ApiFindOne: ApiFindOneEvent,
  ApiCreate: ApiCreateEvent,
  ApiUpdate: ApiUpdateEvent,
  ApiDelete: ApiDeleteEvent,
};

export { EventFields, QueryEventFields };
