export const state = ()=>({
  gitUtil: null
})

export const mutation = {
  setGitUtil (state, instance){
    state.gitUtil = instance
  }
}
