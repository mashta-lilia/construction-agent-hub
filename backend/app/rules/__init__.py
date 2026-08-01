"""Deterministic verdict logic (CLAUDE.md §2.2, §8).

Physically separate from `app.ai`: nothing here imports or calls the AI
layer — the LLM receives a finished verdict as a fact, it never produces
one. Filled in by S3-MATCH-01.
"""
