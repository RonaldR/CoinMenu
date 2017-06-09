import { observable, action, computed } from 'mobx';
import autobind from 'autobind-decorator';

export default class RouterStore {
	@observable route = '';
}
