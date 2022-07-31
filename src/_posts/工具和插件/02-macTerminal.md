---
category: 工具和插件
tags:
  - macOS
  - Terminal
date: 2022-07-31
title: MacOS Terminal 配置指南
vssue-title: MacOS Terminal 配置指南
---


本文主要记录 macOS 下一些常见 Terminal 相关的软件包的安装流程

<!-- more -->

## 1. HomeBrew 

[HomeBrew](https://github.com/Homebrew/brew) 是 `macOS` 下的包管理工具，后续的其他软件包都会通过 `HomeBrew` 来安装，它类似于 `Debian` 下的 `apt`、`CentOS` 下的 `yum`，安装命令如下：
```bash
# 安装 HomeBrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 配置 HomeBrew，安装好之后会提示类似的命令，复制粘贴即可
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> /Users/your_user_name/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## 2. iTerm2 
[iTerm2](https://github.com/gnachman/iTerm2) 是 `macOS` 下常用的终端工具，支持主题配置、智能提示、历史记录等等，利用 `HomeBrew` 进行安装：
```bash
brew install --cask iterm2
```

安装好之后可以通过 `Preferences` 来配置 `Colors`、`Status Bar`、`Hot Key` 等

## 3. oh-my-zsh 
[on-my-zsh](https://github.com/ohmyzsh/ohmyzsh) 是一款开源工具，用于管理 `zsh` 配置，它支持丰富的扩展和主题配置，相关配置存储在 `~/.zshrc` 中，安装命令如下：
```bash
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

## 4. Powerlevel10k 
[Powerlevel10k](https://github.com/romkatv/powerlevel10k) 是一款 `zsh` 中流行的主题包，你可以根据自身喜好决定是否安装，命令如下：
```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

安装完成后在 `.zshrc` 中更改主题设置： 
```
ZSH_THEME="powerlevel10k/powerlevel10k"
```

然后重启终端，跟随引导进行设置就可以应用了，如果设置好之后想要修改，可以通过以下命令重新唤起配置引导：
```bash
p10k configure
```

配置好之后在 VSCode 的终端中会出现配置的 icon 丢失的情况，需要在 `terminal.integrated.fontFamily` 中设置字体为：`MesloLGS NF`，其他更详细的字体相关的问题可以参考：[powerlevel10k/font](https://github.com/romkatv/powerlevel10k/blob/master/font.md)


## 4. zsh-autosuggestions
当你在终端中进行输入时，[zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) 可以帮你根据历史记录和自动补全进行提示，大大提高了效率：
```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

下载完成后在 `.zshrc` 中添加这个扩展：
```bash
plugins=( 
    # other plugins...
    zsh-autosuggestions
)
```

## 5. php
因为本人所使用 `Alfred workflow` 的部分插件依赖于 `php` 运行时，而 macOS 在 `12 Monterey` 版本之后不再默认安装 `php`，因此需要手动安装，相关命令如下：
```bash
brew install php@7.4
```

然后配置 php 命令：

```bash
brew link php@7.4
```

至此，大部分 Terminal 所需软件包安装完成，可以开始愉快的 coding 了~


