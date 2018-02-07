calculate = (str) => {
  var numbers = [];
  var parens = [];
  var sign = "+";

  for(var i = 0; i < str.length; i++) {
    var ch = str.charAt(i);
    if (ch >= '0' && ch <= '9') {
      var num = 0;
      while(i < str.length && str.charAt(i) >= '0' && str.charAt(i) <= '9') {
        num = num*10 + (str.charAt(i)-'0');
        i++;
      }
      i--;
      numbers.push(add(sign,numbers,num));
    } else if (ch == '(') {
      numbers.push(Number.MAX_VALUE);
      parens.push(sign);
      sign = "+";
    } else if (ch == ')') {
      var num = 0;
      while(numbers[numbers.length-1] != Number.MAX_VALUE) {
        num += numbers.pop();
      }
      numbers.pop();
      var op = parens.pop();
      numbers.push(add(op,numbers,num));
    } else if (ch != ' ') {
      sign = ch;
    }
  }

  var ans = 0;
  while(numbers.length != 0) {
    ans += numbers.pop();
  }
  return ans;
}

function add(op,numbers,num) {
  if(op == "+") {
    return num;
  } else if(op == "-") {
    return -num;
  } else if(op == "*") {
    return numbers.pop() * num;
  } else {
    return numbers.pop() / num;
  }
}

judgeValid = (str,currentNumbers) => {
  var left = 0; var prev = "";
  var numbers = [];
  for(var i = 0; i < str.length; i++) {
    var ch = str.charAt(i);
    if(ch >= '0' && ch <= '9') {
      if(prev >= '0' && ch <= '9') {
        return "number inconsistent";
      }
      numbers.push(ch);
    } else if(ch == '(') {
      left++;
    } else if(ch == ')') {
      if(prev == '+' || prev == '-' || prev == '*' || prev == '/') {
        return "invalid operations";
      }
      left--;
      if(left < 0) return "parenthesis problem";
    } else if(ch == '+' || ch == '-' || ch == '*' || ch == '/') {
      if(prev == '+' || prev == '-' || prev == '*' || prev == '/') {
        return "invalid operations";
      }
    } else if(ch != ' '){
      return "invalid characters";
    }

    if(ch != ' ') {
      prev = ch;
    }
  }

  if(prev == '+' || prev == '-' || prev == '*' || prev == '/') {
    return "invalid operations";
  }

  //console.log(numbers);
  //console.log(currentNumbers);

  if(numbers.length != currentNumbers.length) {
    return "number inconsistent";
  }
  numbers.sort(function(a,b) {return a-b;});
  currentNumbers.sort(function(a,b) {return a-b;});
  var s1 = numbers[0]+numbers[1]+numbers[2]+numbers[3];
  var s2 = currentNumbers[0].toString()+currentNumbers[1].toString()
  +currentNumbers[2].toString()+currentNumbers[3].toString();

  if(s1 != s2) {
    return "number inconsistent";
  }

  return left == 0? "valid" : "parenthesis problem";
}

canGet24 = (nums) => {
  var list = [];
  for(var i = 0; i < nums.length; i++) {
    list.push(nums[i]);
  }
  var can = false;
  can = dfs(list,can);
  return can;
}

function dfs(list,can) {
  if(can) {return can;}
  if(list.length == 1) {
    if(Math.abs(list[0]-24) < 0.01) {
      can = true;
    }
    return can;
  } else {
    for(var i = 0; i < list.length; i++) {
      for(var j = 0; j < i; j++) {
        var candidates = [];
        var n1 = list[i]; var n2 = list[j];
        candidates.push(n1+n2,n1-n2,n2-n1,n1*n2);
        if(Math.abs(n1-0) >= 0.01) {candidates.push(n2/n1);}
        if(Math.abs(n2-0) >= 0.01) {candidates.push(n1/n2);}

        list.splice(i,1);
        list.splice(j,1);

        for(var k = 0; k < candidates.length; k++) {
          list.push(candidates[k]);
          can = dfs(list,can);
          list.splice(list.length-1,1);
          if(can) return true;
        }

        list.splice(j,0,n2);
        list.splice(i,0,n1);
      }
    }
  }
  return can;
}

generateQuestionList = () => {
  var ans = [];
  var unique = [];
  var count = 0;
  while(count < 5) {
    var nums = generate4();
    if(canGet24(nums)) {
      var tmp = [nums[0],nums[1],nums[2],nums[3]];
      tmp.sort(function(a,b) {return a-b;});
      var st = tmp[0].toString()+tmp[1].toString()+tmp[2].toString()+tmp[3].toString();
      if(unique.indexOf(st) == -1) {
        count++;
        unique.push(st);
        ans.push(nums);
      }
    }
  }
  return ans;
}

generate4 = () => {
  var nums = [];
  for(var i = 0; i < 4; i++) {
    nums.push(Math.floor(Math.random() * 6) + 1);
  }
  return nums;
}

module.exports = { calculate, judgeValid, generate4, canGet24, generateQuestionList }
