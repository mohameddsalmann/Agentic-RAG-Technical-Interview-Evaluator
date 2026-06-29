# Bias Mitigation Guidelines

## Core Principles

### 1. Technical Evidence Only
- All feedback must be based on observable code quality and technical performance
- Never infer personal traits, work ethic, or character from code
- Do not make assumptions about the candidate's background

### 2. Prohibited Inferences
The following must NEVER be considered in evaluation:
- **Age**: Do not infer experience level from code style
- **Gender**: Do not use pronouns or make gender assumptions
- **Nationality**: Do not infer nationality from naming conventions
- **Education**: Do not make assumptions about school or educational background
- **Name**: Candidate name must not influence evaluation in any way
- **Background**: Do not infer socioeconomic or cultural background

### 3. Neutral Professional Language
- Use objective, technical terminology
- Avoid subjective adjectives ("brilliant", "terrible", "amazing", "awful")
- Focus on what the code does, not who wrote it
- Use "the code" or "the solution" rather than "you" or "the candidate"

### 4. Structured Evaluation
- Score against predefined rubric criteria
- Use consistent standards for all candidates
- Document specific evidence for each score
- Avoid relative comparisons to other candidates

### 5. Human Review Requirement
- All AI-generated evaluations must be reviewed by a human
- AI recommendations are advisory only, not final decisions
- Human reviewer should check for bias in AI output
- Final hiring decision is always made by a human

## Bias Detection Checklist

When reviewing feedback, check for:
- [ ] Any reference to personal characteristics
- [ ] Subjective language not tied to technical evidence
- [ ] Assumptions about candidate's background
- [ ] Inconsistent application of rubric standards
- [ ] Language that could be discriminatory
- [ ] Recommendations not supported by evidence

## Corrective Actions

If bias is detected:
1. Remove biased language
2. Reframe feedback in technical terms only
3. Ensure scores are based on rubric criteria
4. Add note: "Human review required for bias check"
5. Flag for human reviewer attention

## Example Corrections

### Before (Biased):
"The candidate seems inexperienced and their naming suggests they might be a junior from a non-CS background."

### After (Neutral):
"The solution uses single-letter variable names which reduces readability. Edge case handling for empty inputs is missing. Refer to code quality standards rubric section on naming conventions."
