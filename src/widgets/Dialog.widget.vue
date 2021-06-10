<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-show="modelValue"
        v-bind="$attrs"
        ref="modalRef"
        class="bk-modal-mask"
        :style="{ cursor: closableMask ? 'pointer' : 'default' }"
      >
        <transition name="drop-top">
          <div
            v-show="modelValue"
            class="bk-modal-wrap"
          >
            <div
              class="bk-modal-wrap-inner"
              @click.self="maskClick"
            >
              <div
                class="bk-modal-body box-shadow"
                :class="[onlyImageSlot ? 'bk-modal-body--has-image': '', themeClass ]"
                :style="!onlyImageSlot ? { maxWidth: width } : null"
              >
                <button
                  v-if="closeBtn"
                  class="close closeModal"
                  @click="close"
                >
                  <i class="bi bi-x" />
                </button>

                <slot name="image" />

                <slot />
                <div
                  v-if="itHasHeader"
                  class="bk-modal-header"
                >
                  <slot name="header" />
                </div>
                <div
                  v-if="itHasBody"
                  class="bk-modal-content"
                >
                  <slot name="body" />
                </div>
                <div
                  v-if="itHasActions"
                  class="bk-modal-footer"
                >
                  <slot name="actions" />
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script lang="ts">
import { defineComponent, watch, ref, computed } from 'vue'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import useCheckSlot from '@/api/useCheckSlot'
export default defineComponent({
  name: 'Modal',
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: false },
    width: { type: String, default: '500px' },
    closableMask: { type: Boolean, default: true },
    closeOnEsc: { type: Boolean, default: true },
    closeBtn: { type: Boolean, default: true }
  },
  setup (props, { emit, slots }) {
    const modalRef = ref<HTMLElement | null>(null)
    const itHasHeader = useCheckSlot(slots, 'header') !== null
    const itHasBody = useCheckSlot(slots, 'body') !== null
    const itHasActions = useCheckSlot(slots, 'actions') !== null
    const itHasImage = useCheckSlot(slots, 'image') !== null
    function close () {
      emit('update:modelValue', false)
    }
    function maskClick () {
      if (props.closableMask) {
        close()
      }
    }
    watch(
      () => props.modelValue,
      (active: boolean) => {
        if (modalRef.value) {
          return active
            ? disableBodyScroll(modalRef.value, { reserveScrollBarGap: true })
            : setTimeout(enableBodyScroll.bind(this, modalRef.value), 500)
        }
      }
    )
    const onlyImageSlot = computed(() => {
      return itHasImage && !itHasHeader && !itHasBody && !itHasActions
    })

    const themeClass = computed(() => {
      return localStorage.getItem('theme')
    })
    return {
      modalRef,
      maskClick,
      itHasHeader,
      itHasBody,
      itHasActions,
      close,
      onlyImageSlot,
      themeClass
    }
  }
  // todo:
  // public escEvt(e: KeyboardEvent) {
  //   if (e.keyCode === 27 && this.closeOnEsc) {
  //     // 27 === Esc
  //     this.cancelHandler()
  //   }
  // }
})
</script>
<style lang="scss">
@import '@/assets/style/global.scss';
.bk-modal {
  &-mask {
    position: fixed;
    margin: 0;
    left: 0;
    top: 0;
    width: 100%;
    height: 100vh;
    background: linear-gradient( 135deg , rgba(26, 42, 48, 0.95) 0%, rgba(2, 3, 3, 0.95) 100%);
    z-index: 99999;
    overflow-y: scroll;
  }

  &-wrap {
    height: 100vh;
    width: 100%;
    overflow-y: scroll;
    display: table;
    transition-delay: 0.05s;

    &-inner {
      display: table-cell;
      vertical-align: middle;
      padding: 40px 0;
    }
  }

  &-body {
    position:relative;
    overflow: hidden;
    margin: auto;
    border: none;
    border-radius: 3px;
    outline: none;
    //box-shadow: @popup-shadow;
    cursor: default;
    display: table;
    width: 100%;
    text-align: center;
    box-sizing: border-box;
    padding: 24px;

    > img {
      max-width: 100% !important;
      display: block;
    }

    &--has-image {
      position:relative;
      width: auto;
      max-width: 90%;
      border-radius: 10px;
      .close {
        font-size: 2em;
        opacity: 10
      }
      &:after, &:before {
        position:absolute;
        content:'';
        width:100%;
        height: 10%;
        left: 0;
      }
      &:after {
        bottom: 0;
        background:linear-gradient(to bottom, transparent , black);
      }
      &:before {
        top: 0;
        background:linear-gradient(to top, transparent , black);
      }
    }
    .closeModal {
      position:absolute;
      background:transparent;
      border: none;
      outline: none;
      top:0px;
      right: 10px;
      z-index: 9999;
      transition: opacity 0.3s;
      color: $muted;
      border-radius: 50%;
      width:30px;
      height: 30px;
      padding-top: -3px;
      margin: 0;
      cursor: pointer;
      font-size: 2em;
      &:hover {
        opacity:1;
      }
    }

  }

  .bg-dark > .closeModal {
    border: 1px solid white !important;
  }

  &-header {
    padding: 16px 24px;
    font-size: 40.5px;
    font-weight: 500;
    line-height: 1;
    color: white;
    font-weight: 200;
    font-family: "Segoe UI", sans-serif;
    & + .bk-modal-content {
      padding-top: 0;
    }
  }

  &-content {
    padding: 16px 24px;
    font-size: 18px;
    overflow: auto;
    box-sizing: border-box;
    height: fit-content;
    color: #a5c1cc;
  }

  &-footer {
    //background-color: #f7fafc;
    display: flex;
    justify-content: center;
    // flex-direction: row-reverse;
    padding: 16px 24px;
    button {
      border:none;
      background: linear-gradient(to right, rgba(#2ecc71, 50%) 0%, rgba($accept, 100%) 100%);
      color: white;
      font-size: 18px;
      padding: 12px 18px;
      border-radius: 5px;
      margin: 0 5px;
      &.closed {
        background: linear-gradient(to right, rgba(#e74c3c, 50%) 0%, rgba(#c0392b, 100%) 100%);
      }
      &:hover {
        animation: GameTileBorderGlow 0.5s forwards;
      }
    }
    .bk-btn + .bk-btn {
      margin-left: 16px;
    }
  }
}

@keyframes GameTileBorderGlow {
  0% {
    box-shadow: 0 0 0 0rem rgba($principal, 0%); }
  50% {
    box-shadow: 0 0 0 0.1rem rgba($principal, 10%); }
  100% {
    box-shadow: 0 0 0 0.2rem rgba($principal, 100%); } }

.stop-scroll {
  overflow: hidden;
}
</style>
