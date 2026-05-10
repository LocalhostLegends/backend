import {
  ApiPositionTags,
  ApiCreatePosition,
  ApiFindAllPositions,
  ApiFindOnePosition,
  ApiUpdatePosition,
  ApiRemovePosition,
} from './positions.decorators';
import { PositionFields } from './position.fields';

export const swagger = {
  ApiTags: ApiPositionTags,
  ApiCreate: ApiCreatePosition,
  ApiFindAll: ApiFindAllPositions,
  ApiFindOne: ApiFindOnePosition,
  ApiUpdate: ApiUpdatePosition,
  ApiRemove: ApiRemovePosition,
};

export { PositionFields };
