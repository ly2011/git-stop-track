#!/usr/bin/env node

/**
 * https://segmentfault.com/q/1010000000430426
 * 取消已经被git追踪的文件
 * 1. 先把已追踪的文件添加到 `.gitignore` 文件中
 * 2. 运行 `git update-index --assume-unchanged filePath` 取消追踪
 */

// require('shelljs/global')

// if (!which('git')) {
//   echo('Sorry, this script requires git')
//   exit(1)
// } else {
//   echo('已安装git')
// }

const glob = require('tiny-glob')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const argv = require('yargs').alias('f', 'file').argv

let gitignoreFiles = [
  '.eslintignore',
  '.eslintrc.js',
  'package.json',
  'yarn.lock',
  'config/*.*',
  'build/*.*',
  'api-interface/*.*'
]

const resolve = function(dir) {
  return path.resolve(__dirname, dir)
}

const unique = arr => {
  return Array.from(new Set(arr))
}
const difference = (arr1, arr2) => {
  const s = new Set(arr2)
  return arr1.filter(x => !s.has(x))
}

function updateGitignoreConfig() {
  const gitPath = resolve('.git')
  const gitignorePath = resolve('./.gitignore')

  if (!fs.existsSync(gitPath)) {
    return console.error('.git 文件夹不存在')
  }

  let argParams = argv.f

  if (argParams) {
    const tmpArgParams = argParams.includes(',')
      ? argParams.split(',')
      : argParams.split(' ')
    gitignoreFiles = unique(gitignoreFiles.concat(tmpArgParams))
  }
  // console.log('gitignoreFiles: ', gitignoreFiles)

  const lines = fs
    .readFileSync(gitignorePath)
    .toString()
    .split('\n')
  const needGitignoreFiles = difference(gitignoreFiles, lines)
  const needGitignoreFilesStr =
    needGitignoreFiles.length > 0 ? needGitignoreFiles.join('\n') + '\n' : ''
  // console.log('needGitignoreFiles: ', needGitignoreFiles)
  if (!needGitignoreFilesStr) {
    assumeUnchangedFiles(gitignoreFiles) // 至于为何不是传入needGitignoreFiles而是gitignoreFiles，是为了有童鞋已经手动添加到 `.gitignore` 文件导致没有实际停止追踪文件
    return
  }
  fs.appendFile(gitignorePath, needGitignoreFilesStr, err => {
    if (err) return console.error(err)
    console.log('向 gitignore 追加内容成功')
    assumeUnchangedFiles(gitignoreFiles) // 至于为何不是传入needGitignoreFiles而是gitignoreFiles，是为了有童鞋已经手动添加到 `.gitignore` 文件导致没有实际停止追踪文件
  })
}

async function globFiles(files = []) {
  const tmpFiles = await Promise.all(
    files.map(async file => {
      try {
        return await glob(file)
      } catch (err) {
        return undefined
      }
    })
  )
  return [].concat(...tmpFiles.filter(Boolean))
}

async function assumeUnchangedFiles(gitignoreFiles = []) {
  const gitignoreGlobFiles = await globFiles(gitignoreFiles)
  const promiseFiles = gitignoreGlobFiles.map(
    file =>
      new Promise(resolve => {
        exec(`git update-index --assume-unchanged ${file}`, err => {
          // if (err) reject(err)
          resolve()
        })
      })
  )
  Promise.all(promiseFiles)
}

updateGitignoreConfig()
