const User = require("../models/User");
const bcrypt = require('bcrypt');
const Token = require("../models/Token");
const Dog = require("../models/Dogs");
const jwt = require("jsonwebtoken");
const DogsCart = require("../models/DogsCart");
const cors = require("cors");
const cookieParser = require('cookie-parser');
require("../public/lib.js");

module.exports = function (app, objJson, isEmailValid) {
    app.use(cookieParser());
    app.use(cors({
        origin: 'http://localhost:3000', // Thay đổi bằng domain của bạn nếu cần thiết
        credentials: true // Cho phép gửi cookie qua CORS
    }));
    app.get('/', function (req, res) {
        res.send("WELCOM TO DOGSAIGON")
    })

    //User
    app.post("/register", (req, res) => {
        console.log("body", req.body);
        const email = req.body.Email;
        const name = req.body.Name;
        const password = req.body.Password;
        const img = req.body.Image;
        const usertype = req.body.Usertype;
        console.log("email::", email);
        if (!email || !password) {
            res.json({ result: 0, message: "chưa điền tài khoản hoặc mật khẩu." });
        } else {
            //kiểm tra mật khẩu lớn hơn 6 kí tự và kiểm tra email hợp lệ
            if (!isEmailValid(email)) {
                res.json({ result: 0, message: "email không hợp lệ." });
            } else if (password.length < objJson.validateFormat.minPasswordLength) {
                res.json({ result: 0, message: "mật khẩu phải lớn hơn 6 kí tự." });
            } else {
                //kiểm tra người dùng có bị trùng.
                User.findOne({ Email: email }).then((data) => {
                    if (data != null) {
                        res.json({ result: 0, message: "tài khoản đã tồn tại." });
                    } else {
                        //mã hóa password
                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(password, salt, function (err, hash) {
                                if (err) {
                                    res.json({ result: 0, message: "mã hóa thất bại." });
                                } else {
                                    const newUser = new User({
                                        Email: email,
                                        Name: name,
                                        Password: hash,
                                        Image: img,
                                        Usertype: 0,
                                        RegisterDate: Date.now()
                                    })
                                    newUser.save()
                                        .then((data) => {
                                            res.json({ result: 1, message: "đăng ký thành công.", data: data })
                                        })
                                        .catch((err) => {
                                            res.json({ result: 0, message: "đăng ký thất bại..", err: err });
                                        })
                                }
                            });
                        });
                    }
                })
                    .catch((err) => {
                        res.json({ result: 0, message: "tìm thất bại", err: err });
                    })
            }
        }
    })
    app.post("/login", (req, res) => {
        const email = req.body.Email;
        const password = req.body.Password;

        if (!email || !password) {
            res.json({ result: 0, message: "Chưa nhập tài khoản hoặc mật khẩu." });
        } else {
            User.findOne({ Email: email })
                .then((user) => {
                    if (user != null) {
                        bcrypt.compare(password, user.Password, function (err, result) {
                            if (err) {
                                res.json({ result: 0, message: "Giải mã không thành công", err: err });
                            } else {

                                if (result === true) {
                                    jwt.sign({
                                        data: user
                                    }, objJson.secretKey, { expiresIn: 60 * 60 }, function (errT, token) {
                                        if (errT) {
                                            res.json({ result: 0, message: "Tạo Token không thành công." });
                                        } else {
                                            const newToken = new Token({
                                                Email: email,
                                                Token: token,
                                                Status: true,
                                                UserID: user._id,
                                                resgisterDate: Date.now()
                                            })
                                            newToken.save()
                                                .then((data) => {
                                                    res.json({ result: 1, message: "Đăng nhập thành công", data: data, newToken: newToken });
                                                })
                                                .catch((err) => {
                                                    res.json({ result: 0, message: "Lưu Token thất bại", err: err });
                                                })
                                        }
                                    });
                                } else {
                                    res.json({ result: 0, message: "Sai mật khẩu" })
                                }
                            }
                        });
                    } else {
                        res.json({ result: 0, message: "Chưa tạo tài khoản hoặc mật khẩu." });
                    }
                }).catch((err) => {
                    res.json({ result: 0, message: "Lỗi khi tìm tài khoản.", err: err });
                })
        }
    })
    app.post("/listuser", (req, res) => {
        User.find().then((data) => {
            res.json({ result: 1, massage: "Tìm thấy User.", userData: data });
        }).catch((err) => {
            res.json({ result: 0, message: "Không tìm thấy.", err: err });
        })
    })
    app.get("/delete-user/:id", (req, res) => {
        User.findByIdAndDelete(req.params.id)
            .then((data) => {
                res.json({ result: 1, message: "TÌM VÀ XÓA THÀNH CÔNG.", data: data });
            })
            .catch((err) => {
                res.json({ result: 0, message: "TÌM HOẶC XÓA KHÔNG THÀNH CÔNG", err: err });
            })
    })
    app.get("/update-user/:id", (req, res) => {
        User.findById(req.params.id)
            .then((data) => {
                res.json({ result: 1, message: "TÌM ID THÀNH CÔNG", data: data });
            })
            .catch((err) => {
                res.json({ result: 0, message: "TÌM ID KHÔNG THÀNH CÔNG", err: err });
            })
    })
    app.post("/update/:id", (req, res) => {
        User.findByIdAndUpdate(req.params.id, req.body)
            .then((data) => {
                res.json({ result: 1, message: "CHỈNH SỬA THÀNH CÔNG.", data: data });
            })
            .catch((err) => {
                res.json({ result: 0, message: "CHỈNH SỬA KHÔNG THÀNH CÔNG.", err: err });
            })
    })


    //dog
    app.post("/registerDog", (req, res) => {
        Name = req.body.name;
        breed = req.body.breed;
        decription = req.body.decription;
        price = req.body.price;
        img = req.body.imageUrl;
        if (!Name || !breed || !decription || !price) {
            res.json({ result: 0, message: "Chưa nhập dữ liệu." });
        } else {
            const newDog = new Dog({
                name: Name,
                breed: breed,
                decription: decription,
                price: price,
                imageUrl: img,
                registerDate: Date()
            })
            newDog.save().then((data) => {
                res.json({ result: 1, message: "Lưu thành công.", data: data });
            }).catch((err) => {
                res.json({ result: 0, message: "Lưu thất bại.", err: err });
            })
        }
    })
    app.post("/listdog", (req, res) => {
        Dog.find().then((data) => {
            res.json({ result: 1, message: "Tìm thấy chó.", data: data });
        }).catch((err) => {
            res.json({ result: 0, messgage: "Không tùm thấy", err: err });
        })
    })
    app.get("/delete-dog/:id", (req, res) => {
        Dog.findByIdAndDelete(req.params.id)
            .then((data) => {
                res.json({ result: 1, message: "TÌM VÀ XÓA THÀNH CÔNG.", data: data });
            })
            .catch((err) => {
                res.json({ result: 0, message: "TÌM HOẶC XÓA KHÔNG THÀNH CÔNG", err: err });
            })
    })
    app.get("/update-dog/:id", (req, res) => {
        Dog.findById(req.params.id)
            .then((data) => {
                res.json({ result: 1, message: "TÌM THẤY ID DOG", data: data });
            })
            .catch((err) => {
                res.json({ result: 0, message: "KHÔNG TÌM THẤY ID DOG.", err: err });
            })
    })
    app.post("/updateDogs/:id", (req, res) => {
        Dog.findByIdAndUpdate(req.params.id, req.body)
            .then((data) => {
                res.json({ result: 1, message: "CẬP NHẬT THÀNH CÔNG.", data: data });
            })
            .catch((err) => {
                res.json({ result: 0, message: "CHỈNH SỬA THẤT BẠI.", err: err });
            })
    })
    app.post("/dogs-cart", async (req, res) => {
        if (!req.body.userId) {
            res.json({ result: 0, message: "không có ID" });
        } else {
            const DogCart = await DogsCart.findOne({ userId: req.body.userId });
            //console.log("aa", DogCart.dogItems);
            if (DogCart) {
                const data = {
                    $push: {
                        dogItems: req.body.dog_items
                    }
                }
                DogsCart.findOneAndUpdate({ userId: DogCart.userId }, data)
                    .then((data) => {
                        res.json({ result: 1, message: "Lưu thành công tip.", data: data });
                    }).catch((err) => {
                        res.json({ result: 0, message: "Lưu thất bại.", err: err });
                    })
            } else {
                const newDogCart = new DogsCart({
                    dogItems: req.body.dog_items,
                    userId: req.body.userId,
                    registerDate: Date.now()
                })


                newDogCart.save()
                    .then((data) => {
                        res.json({ result: 1, message: "Lưu thành công.", data: data });
                    }).catch((err) => {
                        res.json({ result: 0, message: "Lưu thất bại.", err: err });
                    })
            }
        }
    })
    app.get("/cart", async (req, res) => {
        await DogsCart.findOne({ userId: req.cookies.USERID })
            .then((data) => {
                res.json({ result: 1, message: "tìm thấy chó", data: data });
                //console.log(data);
            })
            .catch((err) => {
                res.json({ result: 0, message: "không tìm thấy chó", err: err });
            })

    })

    //admin
    function checkAdmin(req, res, next) {
        if (!req.body.Token) {
            res.json({ result: 0, message: "KHÔNG CÓ TOKEN." });
        } else {
            const token = req.body.Token;
            Token.findOne({ Token: token, Status: true })
                .then((t) => {
                    if (t == null) {
                        res.redirect("./login");
                        // res.json({result:0, message:"TOKEN BỊ SAI."});
                    } else {
                        jwt.verify(token, objJson.secretKey, function (err, decoded) {
                            if (err) {
                                res.redirect("./login");
                                //res.json({result:0,message:"KHÔNG THỂ VERYFY TOKEN."});
                            } else {
                                if (decoded.data.Usertype === 1) {
                                    next();
                                } else {
                                    res.redirect("./login");
                                    //res.json({result:0, message:"BẠN KHÔNG ĐƯỢC CHO PHÉP."})
                                }
                            }
                        })
                            .catch((err) => {
                                res.json({ result: 0, message: "KHÔNG TÌM THẤT TOKEN.", err: err });
                            })
                    }
                })
        }
    }
    // Middleware để xác thực token
    const authenticateToken = (req, res, next) => {
        //  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        const token = req.cookies.TOKEN;
        if (!token) return res.status(401).send({ message: 'Không tìm thấy token' });
        console.log("token", token);
        jwt.verify(token, objJson.secretKey, (err, user) => {
            if (err) {
                return res.status(403).send({ message: 'Token không hợp lệ' });
            } else {
                req.user = user;
                if (req.user.data.Usertype === 1) {
                    req.user.isAdmin = true;
                } else {
                    req.user.isAdmin = false;
                }
                console.log("ussertype", req.user.data.Usertype);
                next();

            }
        });
    };
    app.get("/checkadmin", authenticateToken, (req, res) => {
        const isAdmin = req.user.isAdmin;
        if (isAdmin) {
            res.json({ result: 1, isAdmin });
        } else {
            res.json({ result: 0 });
        }
    });

    //upload file multer
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/upload')
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname)
        }
    });
    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, cb) {
            console.log(file);
            if (file.mimetype == "image/bmp" || file.mimetype == "image/png"
                || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg"
                || file.mimetype == "image/git") {
                cb(null, true)
            } else {
                return cb(new Error('Only image are allowed!'))
            }
        }
    }).single("avatar");
    //upload file
    app.post("/xuly", function (req, res) {

        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                console.log("A Multer error occurred when uploading.");
            } else if (err) {
                console.log("An unknown error occurred when uploading." + err);
            } else {
                console.log("Upload is okay");
                console.log(req.file); // Thông tin file đã upload
                if (req.file) {
                    res.json({ result: 1, filename: req.file.filename });
                    console.log("img: ", req.file.filename);
                } else {
                    res.json({ result: 0, message: "File upload failed" });
                }
            }

        });
    });
}