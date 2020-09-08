import axios from "axios";

let http = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://test.nicode.top:60006/"
      : "http://localhost:3000/",
  withCredentials: false,
  timeout: 10000,
});

export default {
  get: function (url, params) {
    return new Promise((resolve, reject) => {
      http({
        method: "GET",
        url: url,
        params: params,
      })
        .then(function (res) {
          !res.data.status ? resolve(res) : reject(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  },
  post: function (url, params) {
    return new Promise((resolve, reject) => {
      http({
        method: "POST",
        url: url,
        data: params,
      })
        .then(function (res) {
          !res.data.status ? resolve(res) : reject(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  },
  put: function (url, params) {
    return new Promise((resolve, reject) => {
      http({
        method: "PUT",
        url: url,
        data: params,
      })
        .then(function (res) {
          !res.data.status ? resolve(res) : reject(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  },
  delete: function (url, params) {
    return new Promise((resolve, reject) => {
      http({
        method: "DELETE",
        url: url,
        params: params,
      })
        .then(function (res) {
          !res.data.status ? resolve(res) : reject(res);
        })
        .catch(function (err) {
          reject(err);
        });
    });
  },
};
