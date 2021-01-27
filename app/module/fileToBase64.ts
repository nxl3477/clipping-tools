export function getBase64 (file) {
  return new Promise(function (resolve, reject) {
    let reader = new FileReader()
    let imgResult: string = ''
    reader.readAsDataURL(file)
    reader.onload = function () {
      imgResult = reader.result as string
    }
    reader.onerror = function (error) {
      reject(error)
    }
    reader.onloadend = function () {
      resolve(imgResult)
    }
  })
};