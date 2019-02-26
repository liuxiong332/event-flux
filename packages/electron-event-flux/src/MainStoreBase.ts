import StoreBase from 'event-flux/lib/StoreBase';
import { addStateFilter } from './utils/stateFilterDecorator';

export default addStateFilter(StoreBase);