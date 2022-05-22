window.onload = function () {
  fetch("http://localhost:3000/dir")
    .then(resp => resp.json())
    .then(data => {
      // console.log(data)
      nav(data.name)
      appendTag(document.querySelector(".wrapper-left"), data.dir, "menus", data.path)
    })
  confirm('文件夹点击展示与折叠，首次需要点击二次才可以!!!')
  function nav(pathName) {
    const div = document.createElement('div')
    const nav = document.createElement('nav')
    nav.setAttribute('aria-label', 'breadcrumb')
    nav.setAttribute('class', 'text-danger')
    const ol = document.createElement('ol')
    ol.setAttribute('class', 'breadcrumb')
    const pathArr = pathName.split('\\')
    const divs = document.createElement('div')
    divs.setAttribute('class', 'lis-lrm')

    pathArr.forEach((item) => {
      const li = document.createElement('li')
      li.setAttribute('class', 'breadcrumb-item')
      var text = document.createTextNode(item);
      li.appendChild(text)
      ol.appendChild(li)
      nav.appendChild(ol)
      divs.appendChild(nav)
    })
    div.appendChild(divs)
    const divr = document.createElement('div')
    divr.setAttribute('class', 'divr-lrm')
    divs.appendChild(divr)
    const img = document.createElement('img')
    img.setAttribute('src', './img/33.jpg')
    img.setAttribute('class', 'img-lrm')
    divr.appendChild(img)
    const span = document.createElement('span')
    span.innerHTML = '157*****506'
    divr.appendChild(span)
    const button = document.createElement('button')
    button.innerHTML = '会员中心'
    button.setAttribute('class', 'member-lrm btn btn-warning')
    divr.appendChild(button)
    document.getElementsByTagName("body")[0].insertAdjacentHTML('afterBegin', div.innerHTML)
  }


  function appendTag(parentNode, dir, name, basePath) {
    const ul = document.createElement("ul")
    ul.setAttribute("class", name)
    ul.setAttribute("class", "list-group")
    dir.forEach((item, index) => {
      const li = document.createElement("li")
      li.setAttribute("class", "list-group-item list-group-item-action text-warning")
      li.id = "i_" + index
      if (typeof item === "string") {
        li.innerHTML = item
        li.insertAdjacentHTML('afterBegin', `<svg class='icon' aria-hidden='true'>
              <use xlink:href='#icon-wenjian2'></use>
              <svg>`)
        li.setAttribute("data-path", basePath + "/" + item)
        li.addEventListener("click", e => {
          e.preventDefault()
          e.stopPropagation()
          const suffix = item.slice(item.lastIndexOf(".") + 1)
          if (suffix === "xls" || suffix === "xlsx") {
            getExcel(e.currentTarget.dataset.path)
          } else if (suffix === "pdf") {
            const index = e.currentTarget.dataset.path.lastIndexOf("assets")
            const filepath = e.currentTarget.dataset.path.slice(index + 6)
            getPdf(filepath)
          } else {
            getFile(e.currentTarget.dataset.path)
          }
        }, false)
      } else {
        let flag = true
        li.innerHTML = item.name
        li.insertAdjacentHTML('afterBegin', `<svg class='icon' aria-hidden='true'>
              <use xlink:href='#icon-wenjianjia'></use>
              <svg>`)
        li.addEventListener("click", e => {
          e.preventDefault()
          e.stopPropagation()
          const id = e.currentTarget.id
          const index = parseInt(id.slice(2), 10)
          const son_dir = dir[index]
          // console.log(son_dir)
          const outside = e.currentTarget
          if (flag) {
            appendTag(li, son_dir.dir, "menus_" + son_dir.name, son_dir.path)
          }
          const son = e.currentTarget.children[1]
          $(son).toggle()
          flag = false;
        }, false)

      }
      ul.appendChild(li)
    })
    parentNode.appendChild(ul)

  }

  function getFile(filename) {
    fetch("http://localhost:3000/getfile?path=" + filename)
      .then(res => res.text())
      .then(res => {
        // console.log(res)
        const old = document.querySelector(".wrapper-right div")
        if (old) {
          document.querySelector(".wrapper-right").removeChild(old)
        }
        const pre = document.createElement("div")
        pre.innerHTML = `<pre>${res}</pre>`
        document.querySelector(".wrapper-right").appendChild(pre)
      })
  }

  function getExcel(filename) {
    fetch("http://localhost:3000/getfile?path=" + filename)
      .then(res => res.arrayBuffer())
      .then(res => {
        const data = new Uint8Array(res);
        const workbook = XLSX.read(data, {
          type: "array"
        })
        // console.log(workbook)
        const htmlstr = XLSX.write(workbook, {
          sheet: workbook.SheetNames[0],
          type: 'string',
          bookType: 'html'
        });
        // console.log(htmlstr.toString())
        const old = document.querySelector(".wrapper-right div")
        if (old) {
          document.querySelector(".wrapper-right").removeChild(old)
        }
        const div = document.createElement("div")
        div.innerHTML = htmlstr
        document.querySelector(".wrapper-right").appendChild(div)
        document.querySelector(".wrapper-right table").border = 1
        document.querySelector(".wrapper-right table").style = "border-spacing:0px;"
      })
  }

  function getPdf(filename) {
    const old = document.querySelector(".wrapper-right div")
    if (old) {
      document.querySelector(".wrapper-right").removeChild(old)
    }
    const div = document.createElement("div")
    div.innerHTML = `
  <div>
      <button id="prev">Previous</button>
      <button id="next">Next</button>
      &nbsp; &nbsp;
      <span>Page: <span id="page_num"></span> / <span id="page_count"></span></span>
  </div>
`
    document.querySelector(".wrapper-right").appendChild(div)

    const url = `${window.location.href}files${filename}`;
    //
    // The workerSrc property shall be specified.
    //
    pdfjsLib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.js';

    //
    // Asynchronous download PDF
    //

    const canvas = document.createElement("canvas");
    div.appendChild(canvas)
    canvas.id = "the-canvas"
    canvas.style = "border: 1px solid black; direction: ltr;"
    var pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 1.5,
      ctx = canvas.getContext('2d');

    function renderPage(num) {
      pageRendering = true;
      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport({
          scale: scale,
        });
        // Support HiDPI-screens.
        var outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";

        var transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] :
          null;

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: ctx,
          transform: transform,
          viewport: viewport,
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });
      });

      // Update page counters
      document.getElementById('page_num').textContent = num;
    }

    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }

    function onPrevPage() {
      if (pageNum <= 1) {
        return;
      }
      pageNum--;
      queueRenderPage(pageNum);
    }
    document.getElementById('prev').addEventListener('click', onPrevPage);


    function onNextPage() {
      if (pageNum >= pdfDoc.numPages) {
        return;
      }
      pageNum++;
      queueRenderPage(pageNum);
    }
    document.getElementById('next').addEventListener('click', onNextPage);

    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function (pdfDoc_) {
      pdfDoc = pdfDoc_;
      document.getElementById('page_count').textContent = pdfDoc.numPages;

      // Initial/first page rendering
      renderPage(pageNum);
    });

  }
}