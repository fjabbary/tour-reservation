import { showAlert } from './alert';

// type is either password or 'data'
export const updateSettings = async (data, type) => {
  try {
    const url = type === 'password' ? 'http://localhost:3000/api/v1/users/updateMyPassword' : 'http://localhost:3000/api/v1/users/updateMe'
    const res = await axios({
      method: 'patch',
      url,
      data
    })

    console.log('object');

    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }


  } catch (error) {
    showAlert('error', err.response.data.message)
  }
}