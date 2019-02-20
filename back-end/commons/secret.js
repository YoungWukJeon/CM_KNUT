module.exports = {
  db_info: {
    local: {
      host: "localhost",
      port: "3306",
      user: "cmuser",
      password: "cmpass",
      database: "cm_knut"
    }
  },
  smtp_info: {
    admin: {
      user: "YourEmailID",
      password: "YourEmailPassword",
      host: "smtp.naver.com",
      from: "YourEmailAddress"
    }
  },
  federation: {
    naver: {
      client_id: "",
      secret_id: "",
      callback_url: ""
    },
    google: {
      client_id: "",
      secret_id: "",
      callback_url: ""
    },
    facebook: {
      client_id: "",
      secret_id: "",
      callback_url: ""
    },
    kakao: {
      client_id: "",
      callback_url: ""
    }
  }
};
