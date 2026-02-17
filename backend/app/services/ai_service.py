"""
AI Service for video and image generation using Alibaba Cloud DashScope.
"""
import httpx
import asyncio
from typing import Optional, Dict, Any
from app.core.config import settings


class DashScopeService:
    """Alibaba Cloud DashScope AI service."""

    def __init__(self):
        self.api_key = settings.DASHSCOPE_API_KEY
        self.base_url = settings.DASHSCOPE_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def generate_video_seedance(
        self,
        prompt: str,
        duration: int = 4,
        resolution: str = "1080p"
    ) -> Dict[str, Any]:
        """
        Generate video using Seedance 2.0 model.

        Args:
            prompt: Text description for video generation
            duration: Video duration in seconds (default: 4)
            resolution: Video resolution (default: 1080p)

        Returns:
            Dict containing task_id and status
        """
        url = f"{self.base_url}/api/v1/services/aigc/video-generation/video-synthesis"

        payload = {
            "model": "seedance-2.0",
            "input": {
                "prompt": prompt,
                "duration": duration,
                "resolution": resolution
            },
            "parameters": {
                "seed": None  # Random seed
            }
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers={**self.headers, "X-DashScope-Async": "enable"},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def generate_image_to_video_wan(
        self,
        image_url: str,
        prompt: Optional[str] = None,
        duration: int = 4
    ) -> Dict[str, Any]:
        """
        Generate video from image using Wan2.6-I2V model.

        Args:
            image_url: URL of the input image
            prompt: Optional text prompt for video generation
            duration: Video duration in seconds (default: 4)

        Returns:
            Dict containing task_id and status
        """
        url = f"{self.base_url}/api/v1/services/aigc/video-generation/video-synthesis"

        payload = {
            "model": "wan2.6-i2v",
            "input": {
                "img_url": image_url,
                "duration": duration
            }
        }

        if prompt:
            payload["input"]["prompt"] = prompt

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers={**self.headers, "X-DashScope-Async": "enable"},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()

    async def get_task_status(self, task_id: str) -> Dict[str, Any]:
        """
        Get the status of an async task.

        Args:
            task_id: The task ID returned from generation request

        Returns:
            Dict containing task status and result
        """
        url = f"{self.base_url}/api/v1/tasks/{task_id}"

        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers=self.headers,
                timeout=10.0
            )
            response.raise_for_status()
            return response.json()

    async def wait_for_task_completion(
        self,
        task_id: str,
        max_wait_time: int = 300,
        poll_interval: int = 5
    ) -> Dict[str, Any]:
        """
        Wait for task completion with polling.

        Args:
            task_id: The task ID to wait for
            max_wait_time: Maximum wait time in seconds (default: 300)
            poll_interval: Polling interval in seconds (default: 5)

        Returns:
            Dict containing final task result
        """
        elapsed_time = 0

        while elapsed_time < max_wait_time:
            result = await self.get_task_status(task_id)
            status = result.get("output", {}).get("task_status")

            if status == "SUCCEEDED":
                return result
            elif status == "FAILED":
                raise Exception(f"Task failed: {result.get('output', {}).get('message')}")

            await asyncio.sleep(poll_interval)
            elapsed_time += poll_interval

        raise TimeoutError(f"Task {task_id} did not complete within {max_wait_time} seconds")


class DeepSeekService:
    """DeepSeek AI service for text generation."""

    def __init__(self):
        self.api_key = settings.DEEPSEEK_API_KEY
        self.base_url = settings.DEEPSEEK_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def generate_text(
        self,
        prompt: str,
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> str:
        """
        Generate text using DeepSeek model.

        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature

        Returns:
            Generated text
        """
        url = f"{self.base_url}/v1/chat/completions"

        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json=payload,
                headers=self.headers,
                timeout=60.0
            )
            response.raise_for_status()
            result = response.json()
            return result["choices"][0]["message"]["content"]

    async def optimize_prompt(self, user_input: str) -> str:
        """
        Optimize user input into a better prompt for video generation.

        Args:
            user_input: Raw user input

        Returns:
            Optimized prompt
        """
        system_prompt = """你是一个专业的视频生成提示词优化专家。
请将用户的简单描述转换为详细、具体的视频生成提示词。
要求：
1. 描述要具体、生动
2. 包含场景、动作、氛围等细节
3. 适合AI视频生成模型理解
4. 保持在100字以内
5. 只返回优化后的提示词，不要其他解释"""

        full_prompt = f"{system_prompt}\n\n用户输入：{user_input}\n\n优化后的提示词："

        return await self.generate_text(full_prompt, max_tokens=200, temperature=0.7)


# Global service instances
dashscope_service = DashScopeService()
deepseek_service = DeepSeekService()
