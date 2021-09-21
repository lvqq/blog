---
category: Git
tags:
  - git
date: 2018-09-03
title: 常用Git操作的归纳总结
vssue-title: 常用Git操作的归纳总结
---

![](https://img.nicksonlvqq.cn/2018-09-03/00.png)

在日常的开发过程中离不开git 的接触和使用，这里我总结归纳一下比较常见的以及实际开发过程中常用的 git 命令，持续更新中

<!-- more -->

## 远程仓库

因为远程主机默认的主机名是 origin ，这里的例子均以 origin 为例

```bash
# 获取线上该分支最新的代码
$ git pull origin <分支名>
# 将本地该分支的代码上传到远程仓库
$ git push origin <分支名>
# 强制上传代码到远程仓库
$ git push origin <分支名> -f
# 建立当期分支与远程分支的联系并上传到远程仓库，--set-upstream 可以使用缩写 -u
$ git push --set-upstream origin <分支名>
# 删除远程分支，等同于 git push origin --delete <分支名>，也可以使用缩写 -d
$ git push origin :<分支名>
# 使用目标分支覆盖远程分支，一般适用于分支同步，目标分支既可以是本地分支，也可以是远程分支（加 origin/）
$ git push origin <分支名>:<分支名>
# 列出所有远程主机
$ git remote
# 查看主机的详细信息
$ git remote show <主机名>
# 将远程仓库该分支的最新代码取回本地
$ git fetch origin <分支名>
# 克隆地址所对应的远程仓库的代码到本地
$ git clone <地址>
```

## commit

```bash
# 将更改保存到暂存区
$ git add .
# 提交commit
$ git commit -m "<备注>"
# 添加并提交，相当于 git add . + git commit -m "" 
$ git commit -a -m "<备注>"
# 合并本次修改到上次commit（不会产生新的commit记录）
$ git commit --amend
# 将已被git暂存的文件取消暂存，使 .gitignore 生效
$ git rm -r --cached . && git add .
# 将该 commit id 对应的变更提交到当前分支
$ git cherry-pick <commit id>
```

## branch

```bash
# 切换分支
$ git checkout <分支名>
# 创建并切换至该分支
$ git checkout -b <分支名>
# 创建一个分支关联到远程分支
$ git branch -t <分支名> <远程分支名>
# 修改当前分支的分支名
$ git branch -m "<分支名>"
# 列出各个分支最后提交的信息
$ git branch -v
# 列出本地分支和远程分支的映射关系
$ git branch -vv
# 列出所有本地分支
$ git branch
# 列出所有远程分支
$ git branch -r
# 列出所有分支
$ git branch -a
# 设置当前分支追踪目标分支
$ git brance --set-upstream <分支名>
```

## log

```bash
# 查看commit记录
$ git log
# 查看所有历史操作记录，包括commit和reset的操作和已经被删除的commit记录
$ git reflog / git log -g
# 将commit压缩到一行展示
$ git log --oneline
# 显示每次提交文件的增删数
$ git log --stat
# 显示每次提交具体修改的内容
$ git log -p
# 查看当前仓库状态
$ git status
```

## reset

```bash
# 撤销指定文件在工作区和暂存区的修改
$ git checkout <文件路径>
# 删除所有工作区和暂存区的修改，回到最近一次commit的状态
$ git reset --hard
# 将指针回退三个commit，并改变暂存区
$ git reset HEAD~3 
# 将指针回退三个commit，但不改变暂存区，即删除commit记录，但保留工作区的本次修改
$ git reset --soft HEAD~3
# 将指针回退三个commit，改变工作区，即删除commit记录并回退工作区的修改。
$ git reset --hard HEAD~3
# 回退到指针 HEAD@{1} 的位置，可以通过 git reflog 查看所有操作对应的指针
$ git reset --hard HEAD@{1}
```

## stash

```bash
# 暂时保存没有提交的工作
$ git stash
# 列出所有暂时保存的工作
$ git stash list
# 恢复最近一次stash的文件并删除list中的记录
$ git stash pop
# 恢复最近一次stash的文件但不删除list中的记录
$ git stash apply
# 恢复指定的暂时保存的工作
$ git stash apply stash@{1}
# 丢弃最近一次stash的文件
$ git stash drop
# 删除所有的stash
$ git stash clear
```

## tag
```bash
# 打印所有版本号
$ git tag
# 标记一个本地 tag
$ git tag <版本号>
# 删除一个本地 tag
$ git tag -d <版本号>
# 切换到一个 tag
$ git checkout <版本号>
# 推送单个 tag 到远端
$ git push origin <版本号>
# 删除远程仓库的 tag
$ git push origin --delete <版本号>
# 推送本地所有 tag 到远端
$ git push origin --tags
```

## merge/rebase

```bash
# 将指定分支与当前分支合并
$ git merge <分支名> / git rebase <分支名>
```

有关`git merge`和`git rebase`的区别，可以参考[merge和rebase的选择](https://github.com/geeeeeeeeek/git-recipes/wiki/5.1-%E4%BB%A3%E7%A0%81%E5%90%88%E5%B9%B6%EF%BC%9AMerge%E3%80%81Rebase-%E7%9A%84%E9%80%89%E6%8B%A9)

## 关于git配置

以下命令操作的均为当前仓库git配置，如需操作全局git配置，增加 `--global` 参数即可

```bash
# 配置快捷键，输入git s就代表git status 
$ git config alias.s status 
# 获得git提交的用户名
$ git config user.name
# 获得git提交的邮箱
$ git config user.email
# 更改git提交的用户名
$ git config user.name <用户名>
# 更改git提交的邮箱
$ git config user.email <邮箱>
```
