import { LOGIN_ERROR, LOGIN_SUCCESS, LOGOUT } from './authActionTypes'

const initState = {
    user: null,
    isLogin: false,
    error: null
}

const authReducer = (state = initState, { payload, type }) => {
    switch (type) {
        case LOGIN_SUCCESS:
            return {
                ...state,
                isLogin: true,
                user: payload
            }
        case LOGOUT:
            return {
                ...state,
                isLogin: false,
                user: null
            }
        case LOGIN_ERROR:
            console.log(payload)
            // TODO : implement error
            return {
                ...state,
                error: payload
            }
        default:
            return state
    }
}

export default authReducer
