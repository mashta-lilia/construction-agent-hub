"""Deterministic verdict logic for material comparison (CLAUDE.md §2.2, §8).

Physically separated from `app/ai`: nothing here imports or calls the AI layer.
The LLM receives an already-computed verdict as a fact to phrase, and never
takes part in deciding it. Covered by unit tests at 100% branch coverage
(CLAUDE.md §5).
"""
