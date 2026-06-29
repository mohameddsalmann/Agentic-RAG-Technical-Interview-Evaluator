export const SYSTEM_PROMPT = `You are an expert technical interviewer AI assistant.
You evaluate candidate code submissions for technical interviews.
You must:
- Base all feedback on technical evidence from the code and retrieved rubrics.
- Use neutral, professional language.
- Never infer personal traits, age, gender, nationality, school, or background.
- Provide structured, evidence-based scoring.
- Always recommend human review for final hiring decisions.`;

export const CORRECTNESS_PROMPT = `Analyze the correctness of the following candidate code for the given problem.

Problem: {problem_title}
Problem Description: {problem_description}
Role: {role} ({seniority})
Language: {language}

Candidate Code:
\`\`\`{language}
{candidate_code}
\`\`\`

Retrieved Rubric Evidence:
{rubric_evidence}

Evaluate:
1. Does the code solve the problem correctly?
2. What logic is missing or incorrect?
3. What works well?

Respond in JSON:
{
  "correctness_score": <0-100>,
  "correctness_notes": "<detailed explanation>",
  "strengths": ["<strength 1>", ...],
  "weaknesses": ["<weakness 1>", ...]
}`;

export const COMPLEXITY_PROMPT = `Analyze the time and space complexity of the following code.

Candidate Code:
\`\`\`{language}
{candidate_code}
\`\`\`

Respond in JSON:
{
  "time_complexity": "<Big-O notation>",
  "space_complexity": "<Big-O notation>",
  "complexity_score": <0-100>,
  "complexity_notes": "<explanation of reasoning>"
}`;

export const EDGE_CASE_PROMPT = `Identify missed edge cases in the following candidate code.

Problem: {problem_title}
Problem Description: {problem_description}

Candidate Code:
\`\`\`{language}
{candidate_code}
\`\`\`

Retrieved Rubric Evidence:
{rubric_evidence}

Respond in JSON:
{
  "edge_case_score": <0-100>,
  "missed_edge_cases": ["<edge case 1>", ...],
  "edge_case_notes": "<explanation>"
}`;

export const CODE_QUALITY_PROMPT = `Evaluate the code quality of the following submission.

Candidate Code:
\`\`\`{language}
{candidate_code}
\`\`\`

Retrieved Rubric Evidence:
{rubric_evidence}

Evaluate: readability, naming, maintainability, modularity, error handling, security.

Respond in JSON:
{
  "readability_score": <0-100>,
  "maintainability_score": <0-100>,
  "communication_score": <0-100>,
  "quality_notes": "<detailed explanation>"
}`;

export const SCORING_PROMPT = `Based on the following evaluation data, generate final scores and a recommendation.

Evaluation Data:
{evaluation_state}

Scoring weights:
- Correctness: 30%
- Complexity: 15%
- Edge Cases: 15%
- Readability: 10%
- Maintainability: 10%
- Communication: 20%

Recommendation must be one of: Strong Hire, Hire, Lean Hire, Lean No Hire, No Hire

Respond in JSON:
{
  "overall_score": <0-100>,
  "recommendation": "<one of the options>",
  "final_feedback": "<professional feedback paragraph>",
  "bias_mitigation_notes": ["<note 1>", ...]
}`;

export const BIAS_MITIGATION_PROMPT = `Review the following feedback for any bias or personal judgments.

Feedback to review:
{feedback}

Check for:
- References to personal traits (age, gender, nationality, school, background)
- Subjective or non-technical language
- Any inference about the candidate as a person rather than the code

Respond in JSON:
{
  "is_biased": <true/false>,
  "bias_issues": ["<issue 1>", ...],
  "corrected_notes": ["<neutral note 1>", ...]
}`;
