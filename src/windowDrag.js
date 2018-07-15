
export default class WindowDrag {
  dragIndex = 0 
  constructor(){
    window.addEventListener("dragover", e => {
      e.preventDefault()
    })
    window.addEventListener("dragenter", e => {
      this.dragIndex++ 
      e.preventDefault()
      if (this.onDragEnter) this.onDragEnter(e)
    })
    window.addEventListener("dragleave", e => {
      if (--this.dragIndex === 0 && this.onDragLeave) this.onDragLeave(e)
      e.preventDefault()
  })
    window.addEventListener("drop", e => {

      if (this.dragIndex > 0){
        if (--this.dragIndex === 0 && this.onDragLeave){
          this.onDragLeave()
        }
      }

      if (this.onDrop) this.onDrop(e)
      e.preventDefault()
    })
  }
}