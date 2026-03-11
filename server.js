// server.js
// Cách chạy:
// 1. Cài Node.js
// 2. Tạo thư mục mới, lưu file này là server.js
// 3. Chạy: npm init -y
// 4. Cài express: npm install express
// 5. Chạy: node server.js
// 6. Mở trình duyệt: http://localhost:3000/add để thêm từ
//    http://localhost:3000/study để học từ

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File lưu ở ổ D
const FILE_PATH = "./vocab.json";

// Đảm bảo file tồn tại
if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]));
}

function readVocab() {
    const data = fs.readFileSync(FILE_PATH);
    return JSON.parse(data);
}

function saveVocab(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

// ====== WEB THÊM TỪ ======
app.get("/add", (req, res) => {

    const words = readVocab();

    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const start = (page - 1) * perPage;
    const pageWords = words.slice(start, start + perPage);

    const totalPages = Math.ceil(words.length / perPage);

    let rows = "";

    pageWords.forEach((w, i) => {

    const realIndex = start + i;

    rows += `
    <tr>
        <td>${realIndex + 1}</td>
        <td>${w.english}</td>
        <td>${w.vietnamese}</td>

        <td>
            <button onclick="deleteWord(${realIndex})">
                🚮
            </button>
        </td>
    </tr>
    `;
    });

    let pages = "";

    for (let i = 1; i <= totalPages; i++) {
        pages += `<a href="/add?page=${i}" style="margin:5px">${i}</a>`;
    }

    res.send(`
    <html>
    <head>
        <meta charset="UTF-8">

        <style>

        body{
            font-family: Arial;
            padding:40px;
        }

        table{
            border-collapse: collapse;
            width:100%;
            margin-top:20px;
        }

        th,td{
            border:1px solid #ccc;
            padding:8px;
            text-align:center;
        }

        th{
            background:#3498db;
            color:white;
        }

        input{
            padding:6px;
            width:200px;
        }

        button{
            padding:6px 12px;
        }

        </style>

    </head>
    <script>

        function deleteWord(index){

        fetch("/delete/" + index,{
            method:"POST"
        })
        .then(()=>location.reload());

        }

    </script>
    <body>

    <h2>➕ Thêm từ vựng nha</h2>

    <form method="POST" action="/add">

        English:<br>
        <input id="en" type="text" name="english" required
        onkeydown="if(event.key==='Enter'){document.getElementById('vi').focus();return false;}">
        <br><br>

        Tiếng Việt:<br>
        <input id="vi" type="text" name="vietnamese" required
        onkeydown="if(event.key==='Enter'){this.form.submit();}">
        <br><br>

        <button>Lưu</button>

    </form>

    <br>

    <h3>📚 Từ đã lưu</h3>

    <table>

    <tr>
    <th>STT</th>
    <th>English</th>
    <th>Tiếng Việt</th>
    <th>Xóa</th>
    </tr>

    ${rows}

    </table>

    <br>

    ${pages}

    <br><br>

    <a href="/study">📘 Đi học từ</a>

    </body>
    </html>
    `);
});

app.post("/add", (req, res) => {
    const { english, vietnamese } = req.body;

    const vocab = readVocab();
    vocab.push({ english, vietnamese });
    saveVocab(vocab);

    res.redirect("/add");
});

app.get("/study", (req, res) => {

    const words = readVocab();
    const mode = req.query.mode || "en"; 
    let question = "";
    let answer = "";

    if (mode === "en") {
        question = "Tiếng Việt";
        answer = "Nhập English";
    } else {
        question = "English";
        answer = "Nhập Tiếng Việt";
    }
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Study Vocabulary</title>

        <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(to right, #dfe9f3, #ffffff);
            padding: 30px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }

        th {
            background: #3498db;
            color: white;
            padding: 12px;
        }

        td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: center;
        }

        tr:hover {
            background: #f2f2f2;
        }

        input {
            padding: 6px;
            width: 80%;
            border-radius: 6px;
            border: 1px solid #ccc;
        }

        .delete-btn {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
        }

        .delete-btn:hover {
            background: #c0392b;
        }
        </style>
    </head>
    <body>

        <h2>📘 Kiểm tra từ vựng (Nhập English)</h2>
        <form method="GET" action="/study">
        <select name="mode">
            <option value="en" ${mode==="en"?"selected":""}>
                Kiểm tra English
            </option>

            <option value="vi" ${mode==="vi"?"selected":""}>
                Kiểm tra Tiếng Việt
            </option>
        </select>

        <button type="submit">Đổi chế độ</button>
        </form>
        <table>
            <tr>
            <th>STT</th>
            <th>${question}</th>
            <th>${answer}</th>
            <th>Kết quả</th>
            <th>Xóa</th>
            </tr>
    `;

    words.forEach((w, i) => {
        if (mode === "en") {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${w.vietnamese}</td>
                <td>
                    <input type="text"
                    onkeydown="if(event.key==='Enter') checkAnswer(this, '${w.english.replace(/'/g,"\\'")}', ${i})">
                </td>
                <td id="result-${i}"></td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteWord(${i})">
                        🚮
                    </button>
                </td>
            </tr>
        `;
        }
        else {
        html += `
            <tr>
                <td>${i + 1}</td>
                <td>${w.english}</td>
                <td>
                    <input type="text"
                    onkeydown="if(event.key==='Enter') checkAnswer(this, '${w.vietnamese.replace(/'/g,"\\'")}', ${i})">
                </td>
                <td id="result-${i}"></td>
                <td>
                    <button class="delete-btn"
                        onclick="deleteWord(${i})">
                        🚮
                    </button>
                </td>
            </tr>
        `;   
        }
    });

    html += `
        </table>

        <script>
        function checkAnswer(input, correct, index) {

                let resultCell = document.getElementById("result-" + index);

                if (input.value.trim().toLowerCase() === correct.toLowerCase()) {
                    resultCell.innerHTML = "✅";
                } else {
                    resultCell.innerHTML = "❌ " + correct;
                }

                let inputs = document.querySelectorAll("input");
                if(inputs[index+1]){
                    inputs[index+1].focus();
                }
            }

        function deleteWord(index) {
            fetch("/delete/" + index, { method: "POST" })
                .then(() => location.reload());
        }
        </script>

        <br><br>
        <a href="/add">➕ Thêm từ</a>

    </body>
    </html>
    `;

    res.send(html);
});
app.post("/delete/:index", (req, res) => {
    const index = parseInt(req.params.index);
    const words = readVocab();

    words.splice(index, 1);
    saveVocab(words);

    res.sendStatus(200);
});
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
