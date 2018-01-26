package interconnections;

import com.google.common.collect.Sets;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Test {


    public static void main(String[] args) {

        HashSet<Integer> a = Sets.newHashSet(2, 3, 4);
        HashSet<Integer> b = Sets.newHashSet(2, 3, 4, 5);

        Set<List<Integer>> lists = Sets.cartesianProduct(a, b);

        System.out.println(lists);
    }
}
