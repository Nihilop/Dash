import { ref } from 'vue'

export default function (slots, name) {
  return name in slots ? ref(slots[name]) : null
}
