import * as positionDecorators from './positions.decorators';
import { PositionFields } from './position.fields';

export const swagger = {
  ApiTags: positionDecorators.ApiPositionTags,
  ApiCreate: positionDecorators.ApiCreatePosition,
  ApiFindAll: positionDecorators.ApiFindAllPositions,
  ApiFindOne: positionDecorators.ApiFindOnePosition,
  ApiUpdate: positionDecorators.ApiUpdatePosition,
  ApiRemove: positionDecorators.ApiRemovePosition,
};

export { PositionFields };
