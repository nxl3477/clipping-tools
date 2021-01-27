export function b64ToFile (base64, fileName = 'tmp.png', sliceSize) {
  var block = base64.split(';')
  // Get the content type of the image
  var contentType = block[0].split(':')[1]// In this case "image/gif"
  // get the real base64 content of the file
  var b64Data = block[1].split(',')[1]// In this case "R0lGODlhPQBEAPeoAJosM
  contentType = contentType || ''
  sliceSize = sliceSize || 512

  var byteCharacters = atob(b64Data)
  var byteArrays = []

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize)

    var byteNumbers = new Array(slice.length)
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    var byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)
  }

  var blob = new Blob(byteArrays, { type: contentType })
  return new File([blob], fileName)
}
