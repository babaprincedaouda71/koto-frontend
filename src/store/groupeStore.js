import { create } from 'zustand'

const useGroupeStore = create((set) => ({
    groupes: [],
    groupeActif: null,

    setGroupes: (groupes) => set({ groupes }),
    setGroupeActif: (groupe) => set({ groupeActif: groupe }),
    reset: () => set({ groupes: [], groupeActif: null }),
}))

export default useGroupeStore