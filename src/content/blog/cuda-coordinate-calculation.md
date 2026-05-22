---
title: "CUDA 坐标计算"
description: "梳理 CUDA Kernel 中一维、二维、三维全局索引的计算方式，以及 RGB 图像灰度转换示例。"
pubDate: "May 22 2026"
image: /image/image1.jpg
categories:
  - C/C++
  - AI infra
tags:
  - CUDA
  - C++
  - GPU
badge: Pin
---
## 计算坐标

```c++
threadIdx.x/y/z  // 线程在块内的局部索引  0 ~ blockDim - 1
blockIdx.x/y/z   // 块在网格内的索引   0 ~ gridDim - 1
blockDim.x/y/z   // 每个块每维的线程数
gridDim.x/y/z    // 网格每维的块数 
```



**一维坐标计算：**

`int global_id = blockIdx.x * blockDim.x + threadIdx.x;`

同时记得边界保护，网格覆盖的线程可能会超过数据总量N

`if (global_id < N){ 安全处理 }`

<img src="https://dlog.com.cn/_astro/002.BbsP-Y1j_2sV3tM.webp" alt="一维全局索引计算方式" style="zoom:80%;" />



**二维坐标计算：**

```c++
int col = blockIdx.x * blockDim.x + threadIdx.x; // 列方向，当前块之前的数量 * 每块宽度 + 当前块内的线程偏移
int row = blockIdy.y * blockDim.y + threadIdy.y; // 行方向，当前块之前的数量 * 每块高度 + 当前块内的线程偏移

if (row < height && col < width) {
    int global_idx = row * width + col; // 一维地址
}
```

<img src="https://dlog.com.cn/_astro/003.DbAsiMCW_1mrdxw.webp" alt="二维全局索引计算方式" style="zoom:80%;" />



**例子：RGB 图像转灰度图**

在一个 Kernel 中，每个线程负责处理图像中的一个像素点，通过上述的公式计算出每个像素的行和列。

```c++
__global__ void rgbToGray(const uchar3* d_img, unsigned char* d_gray, int width, int height){
    int x = blockId.x * blockDim.x + threadIdx.x;
    int y = blockId.y * blockDim.y + threadIdy.y;
    
    if (x < width && y < height) {
        int idx = y * width + x;
        
        // 读取原始 RGB 像素
        uchar3 pixel = d_img[idx];
        
        unsigned char gray = static_cast<unsigned char>(0.299f * pixel.x + 0.587f * pixel.y + 0.114f * pixel.z);
        d_gray[idx] = gray;
    }
}
```

实际中的完整代码:

```c++
#include <iostream>
#include <opencv2/opencv.hpp>
#include <cuda_runtime.h>
#include <string>

__global__ void rgbToGray(const uchar3* d_img, unsigned char* d_gray, int width, int height) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;

    if (x < width && y < height) {
        int idx = y * width + x;
        uchar3 pixel = d_img[idx];
        // 使用加权平均法将RGB转换为灰度
        d_gray[idx] = static_cast<unsigned char>(0.299f * pixel.x + 0.587f * pixel.y + 0.114f * pixel.z);
    }
}

using namespace std;

int main() {
    string imagePath = "input.png";
    cv::Mat img = cv::imread(imagePath);
    
    if (img.empty()) {
        cerr << "无法加载图像: " << imagePath << endl;
        return -1;
    }
	
    int width = img.cols, height = img.rows;
    int channels = img.channels();
    
    uchar* d_img; // GPU 原始图像数据
    unsigned char* d_gray; // GPU上的灰度图像
    cout << "图像尺寸: " << width << "x" << height << ", 通道数: " << channels << endl;
	
    // 定义 CUDA 内核的块和网格大小
    // 每个 block 处 负责图像中一列的 256 个连续像素.
    dim3 blockSize(1, 256);
    const int iterations = 10000;
    
    size_t imgSize  = width * height * sizeof(uchar3);
    size_t graySize = width * height * sizeof(unsigned char);
    
    // 在 GPU 上分配内存
    cudaMalloc(&d_img, imgSize);
    cudaMalloc(&d_gray, graySize);
    
    // 将图像数据从 CPU 复制到 GPU
    cudaMemcpy(d_img, img.data, imgSize, cudaMemcpyHostToDevice);
    
    // 取上整除
    dim3 gridSize((width + blockSize.x - 1) / blockSize.x, (height + blockSize.y - 1) / blockSize.y);
    
    // <<<gridSize, blockSize>>>: 启动 CUDA kernel
    // reinterpret_cast<uchar3*>(d_img): 类型转换, 把 d_img 这块 GPU 内存解释成 uchar3* 类型
    // 三通道数据类型，正好用来表示一个 RGB 像素
    // 在 GPU 上启动 rgbToGray kernel，把 GPU 内存中的 RGB 图像 d_img 转成灰度图像 d_gray，图像尺寸是 width × height。
    rgbToGray<<<gridSize, blockSize>>>(reinterpret_cast<uchar3*>(d_img), d_gray, width, height);
    
    cudaGetLastError(); // 检查内核启动是否成功
    cudaDeviceSynchronize(); // 让 CPU 等待 GPU 当前已经提交的任务全部执行完; 避免 CPU 可能会在 GPU 还没处理完图像时继续往下执行
    cudaEvent_t start, stop;
    float total_time = 0.0f;
    
    cudaEventCreate(&start);
  	cudaEventCreate(&stop);
    cout << "正在测试 GPU性能 ..." << endl;
    
    for (int i = 0; i < iterations; i ++) {
        cudaEventRecord(start);
        rgbToGray<<<gridSize, blockSize>>>(reinterpret_cast<uchar3*>(d_img), d_gray, width, height);
        cudaEventRecord(stop);
        cudaEventSynchronize(stop);
        
        float single_time = 0.0f;
        cudaEventElapsedTime(&single_time, start, stop);
        total_time += single_time;
    }
    
    float avg_time = total_time / iterations;
    cout << "平均每次转换时间: " << avg_time << " ms" << endl;
    
    // 将结果从 GPU 复制回 CPU
    cv::Mat grayImg(height, width, CV_8UC1);
    cudaMemcpy(grayImg.data, d_gray, graySize, cudaMemcpyDeviceToHost);
    cv::imwrite("output.png", grayImg);
    
    // 释放 GPU 内存
    cudaFree(d_img);
    cudaFree(d_gray);
}
```



**三维坐标计算：**

假设有一个 `256 × 256 × 128` 的 CT 图像（宽×高×深度），每个体素是一个16位整数。我们要用CUDA把它变成浮点数，并除以最大灰度值，得到归一化的3D数组。

同样地，有：

```c++
int x = blockIdx.x * blockDim.x + threadIdx.x;
int y = blockIdx.y * blockDim.y + threadIdx.y;
int z = blockIdx.z * blockDim.z + threadIdx.z;

if (x < dimX && y < dimY && z < dimZ) {
	int global_idx = z * dimY * dimX + y * dimX + x; 
}
```

![三维坐标计算演示](https://dlog.com.cn/_astro/004.Bgaxujgw_XFgdz.webp)



> **三维块的硬件限制**
>
> CUDA 规定每个 Block 的总线程数不能超过 **1024**。  
> 三维块尺寸乘积必须 ≤ 1024，例如 `8×8×8 = 512` 合法，`16×16×16 = 4096` 非法。












