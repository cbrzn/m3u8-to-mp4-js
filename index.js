/**
 * @description M3U8 to MP4 Converter
 * @author Furkan Inanc
 * @version 1.0.2
 */

const ffmpeg = require("fluent-ffmpeg");

/**
 * A class to convert M3U8 to MP4
 * @class
 */
class m3u8ToMp4Converter {
  constructor() {
    this.M3U8_FILE = null;
    this.OUTPUT_FILE = null;
    this.START_TIME = null;
    this.DURATION = null;
  }

  /**
   * Sets the input file
   * @param {String} filename M3U8 file path. You can use remote URL
   * @returns {Function}
   */
  setInputFile(filename) {
    if (!filename) throw new Error("You must specify the M3U8 file address");
    this.M3U8_FILE = filename;
    return this;
  }

  /**
   * Sets the output file
   * @param {String} filename Output file path. Has to be local :)
   * @returns {Function}
   */
  setOutputFile(filename) {
    if (!filename) throw new Error("You must specify the file path and name");
    this.OUTPUT_FILE = filename;
    return this;
  }

  /**
   * Sets the start time for the output
   * @param {String|Number} time Start time in seconds or time format (e.g., "00:01:30")
   * @returns {Function}
   */
  setStartTime(time) {
    if (time === undefined || time === null) {
      throw new Error("You must specify a valid start time");
    }
    this.START_TIME = time;
    return this;
  }

  /**
   * Sets the duration for the output
   * @param {String|Number} time Duration in seconds or time format (e.g., "30")
   * @returns {Function}
   */
  setDuration(time) {
    if (time === undefined || time === null) {
      throw new Error("You must specify a valid duration");
    }
    this.DURATION = time;
    return this;
  }

  /**
   * Starts the process
   */
  start(options = {}) {
    return new Promise((resolve, reject) => {
      options = Object.assign(
        {
          onStart: (commandLine) => {
            console.log("FFmpeg command:", commandLine);
          },
          onEnd: () => {},
          onError: (error) => {
            reject(new Error(error));
          },
          onProgress: (progress) => {
            console.log("Progress:", progress.percent + "%");
          },
          onStderr: () => {},
          onCodecData: (data) => {
            console.log("Codec data:", data);
          },
        },
        options
      );

      if (!this.M3U8_FILE || !this.OUTPUT_FILE) {
        reject(new Error("You must specify the input and the output files"));
        return;
      }

      const ffmpegCommand = ffmpeg(this.M3U8_FILE);

      if (this.START_TIME) {
        ffmpegCommand.outputOptions(`-ss ${this.START_TIME}`);
      }

      if (this.DURATION) {
        ffmpegCommand.outputOptions(`-t ${this.DURATION}`);
      }

      ffmpegCommand
        .on("start", options.onStart)
        .on("codecData", options.onCodecData)
        .on("progress", options.onProgress)
        .on("error", options.onError)
        .on("stderr", options.onStderr)
        .on("end", (...args) => {
          resolve();
          options.onEnd(...args);
        })
        .outputOptions("-c:v libx264")
        .outputOptions("-preset medium")
        .outputOptions("-crf 23")
        .outputOptions("-g 1")
        .outputOptions("-c:a aac")
        .outputOptions("-b:a 128k")
        .outputOptions("-bsf:a aac_adtstoasc")
        .outputOptions("-map 0")
        .outputOptions("-f mp4")
        .output(this.OUTPUT_FILE)
        .run();
    });
  }
}

module.exports = m3u8ToMp4Converter;