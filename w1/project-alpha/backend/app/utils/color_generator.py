import random
from typing import List

TAG_COLORS: List[str] = [
    "#EF4444",  # red-500
    "#F59E0B",  # amber-500
    "#10B981",  # emerald-500
    "#3B82F6",  # blue-500
    "#8B5CF6",  # violet-500
    "#EC4899",  # pink-500
    "#6366F1",  # indigo-500
    "#14B8A6",  # teal-500
]


def generate_random_color() -> str:
    """生成随机标签颜色"""
    return random.choice(TAG_COLORS)
