import Vue from 'Vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const store = new Vuex.Store({
	// 定义状态
	state: {
		purseVersion: '1.0.0',
		weizhi:'重庆市',
	},
	actions: {
		
	}
})
export default store