const LOCAL_STORAGE_NAME = "bloodorca@hollow"

export default class History {
  constructor(){
    this.syncFromLocalStorage()
  }
  count(){
    return this.history.length 
  }
  syncFromLocalStorage(){
    var res = localStorage.getItem(LOCAL_STORAGE_NAME)
    this.history = res ? JSON.parse(res).history : [] 
    this.history.forEach(item => {
      item.date = new Date(item.date)
    })
    if (this.onChange) this.onChange()
  }
  syncToLocalStorage(){
    try {
      localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify({history: this.history}))
    } catch (err){
      var departed = this.history[this.history.length-1]
      console.error(`localStorage quota reached! Removing "${departed.hash}", the least recent file.`)
      this.removeLeastRecent()
      this.syncToLocalStorage()
    }
  }
  addToHistory(jsonString, fileName, hash){
    this.history.unshift({
      date: new Date(), 
      fileName, 
      jsonString,
      hash: hash 
    })
    if (this.onChange) this.onChange()
  }
  removeFromHistory(hash){
    this.history = this.history.filter(item => item.hash != hash)
    if (this.onChange) this.onChange()
  }
  removeLeastRecent(){
    if (this.history.length != 0){
      this.history.pop() 
    }
    if (this.onChange) this.onChange()
  }
}