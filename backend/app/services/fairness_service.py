from fairness import evaluate_fairness


def compute_fairness(y_true, y_pred, sensitive):
    return evaluate_fairness(y_true, y_pred, sensitive)
