CKEDITOR.plugins.add("keyboard_language", {
  init: function (editor) {
    editor.addCommand("keyboard_language", {
      exec: function (editor) {
        let textarea_lang, chooseLang, chooseLangVal, _keyboard;

        Swal.fire({
          title: "keyboard language",
          width: "42em",
          html: `
          <div class="row" style="margin:0; display:flex; gap:5px; flex-direction:column;">
            <select class="form-control choose-lang">
              <option value="english|ltr">English</option>
              <option value="arabic|rtl">Arabic</option>
              <option value="javanese|ltr">Javanese</option>
            </select>
            <textarea class="form-control input-keyboard-lang" rows="5" style="resize:vertical;" data-lang=""></textarea>
            <div class="simple-keyboard"></div>
          </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Simpan",
          cancelButtonText: "Batal",
          didOpen: () => {
            const popup = Swal.getPopup();
            textarea_lang = popup.querySelector(".input-keyboard-lang");
            chooseLang = popup.querySelector(".choose-lang");
            chooseLangVal = chooseLang.value.split("|");

            let Keyboard = window.SimpleKeyboard.default;
            function initKeyboard(langLayout) {
              if (_keyboard) {
                _keyboard.destroy();
              }

              _keyboard = new Keyboard({
                onChange: (input) => {
                  document.querySelector(".input-keyboard-lang").value = input;
                },
                onKeyPress: (button) => {
                  if (button === "{shift}" || button === "{lock}") {
                    // handle shift
                    let currentLayout = _keyboard.options.layoutName;
                    let shiftToggle =
                      currentLayout === "default" ? "shift" : "default";

                    _keyboard.setOptions({
                      layoutName: shiftToggle,
                    });
                  }
                },
                ...langLayout,
              });

              const condRtl = chooseLangVal[1] === "rtl";
              textarea_lang.style.direction = condRtl ? "rtl" : "";
              textarea_lang.style.fontSize = condRtl ? "20px" : "";

              textarea_lang.addEventListener("input", (event) => {
                _keyboard.setInput(event.target.value);
              });

              textarea_lang.setAttribute("data-direction", chooseLangVal[1]);
            }

            import(`./lang/english.js`).then((module) => {
              initKeyboard(module.layout, "english");
            });

            chooseLang.addEventListener("change", (e) => {
              chooseLangVal = e.target.value.split("|");
              import(`./lang/${chooseLangVal[0]}.js`).then((module) => {
                // console.log(module.layout);
                initKeyboard(module.layout);
              });
            });
          },
          preConfirm: () => {
            if (!textarea_lang.value || textarea_lang.value == "") {
              Swal.showValidationMessage(`Input tidak boleh kosong.`);
            }
            return { inputLang: textarea_lang.value };
          },
        }).then((result) => {
          if (result.value) {
            const res = result.value.inputLang;
            const currentContent = editor.getData();
            let newContent = `<p><span dir="${chooseLangVal[1]}">${res}</span></p>`;

            newContent = currentContent + newContent;
            editor.setData(newContent);
          }
        });
      },
    });

    editor.ui.addButton("keyboard_language", {
      label: "Keyboard Language",
      command: "keyboard_language",
      toolbar: "keyboardGroup",
      icon: this.path + "keyboardLanguage.png",
    });
  },
});
